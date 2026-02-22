import Stripe from "stripe";
import { envConfig } from "../../config/env";
import { stripe } from "../../config/stripe";
import { sendError, sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../generated/prisma/enums";
import { AppError } from "../../utils/AppError";
import { generatePaymentInvoiceBuffer } from "../payment/payment.utils";
import { v7 as uuidv7 } from "uuid";
import { uploadPdfBufferToCloudinary } from "../media/media.service";
import status from "http-status";
import { emailQueue } from "../../queue/emailQueue";

const handleStripeWebHookEventController = asyncHandler(async (req, res) => {
  console.log("receive wehhook...");
  
  const endpointSecret = envConfig.STRIPE_WEBHOOK_SECRET;
  let event: any;
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature!,
        endpointSecret
      );
    } catch (err: any) {
      console.log(`⚠️ Webhook signature verification failed.`, err.message);
      return sendError(res, {
        statusCode: 400,
        message: err.message || "Error  occurred by stripe webhook"
      });
    }
  }


  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id
    }
  })

  if (existingPayment) {
    console.log(`Event ${event.id} already processed. Skipping`);
    return { message: `Event ${event.id} already processed. Skipping` }
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object

      const appointmentId = session.metadata?.appointmentId

      const paymentId = session.metadata?.paymentId

      if (!appointmentId || !paymentId) {
        console.error("Missing appointmentId or paymentId in session metadata");
        return { message: "Missing appointmentId or paymentId in session metadata" }
      }

      const appointment = await prisma.appointment.findUnique({
        where: {
          id: appointmentId
        },
        include: { doctor: true, patient: true, payment: true }
      })

      if (!appointment) {
        console.error(`Appointment with id ${appointmentId} not found`);
        return { message: `Appointment with id ${appointmentId} not found` }
      }

      await prisma.$transaction(async (tx) => {
        await tx.appointment.update({
          where: {
            id: appointmentId
          },
          data: {
            paymentStatus: session.payment_status === "paid" ? PaymentStatus.COMPLETE : PaymentStatus.PENDING
          }
        });

        await tx.payment.update({
          where: {
            id: paymentId
          },
          data: {
            stripeEventId: event.id,
            status: session.payment_status === "paid" ? PaymentStatus.COMPLETE : PaymentStatus.PENDING,
            paymentGatewayData: session as any,
          }
        });
      });
      // send mail if payment success 

      const invoicePdfPayload = {
        status: session.payment_status === "paid" ? PaymentStatus.COMPLETE : PaymentStatus.PENDING,
        invoiceNumber: uuidv7(),
        doctorName: appointment.doctor.name,
        patientName: appointment.patient.name,
        patientEmail: appointment.patient.email,
        paymentTime: Date.now(),
        paymentMethod: "card",
        appointmentFee: appointment.payment?.amount as number,
        quantity: 1,
        totalAmount: appointment.payment?.amount! * 1,
        message: session.payment_status === "paid" ? "✔ Payment Successful! Your appointment has been confirmed. A confirmation SMS has been sent." : "✘ Payment Failed! Insufficient balance or transaction declined by bank. Please try again."
      }

      const invoicePdfBuffer = await generatePaymentInvoiceBuffer(invoicePdfPayload);

      const cloudInaryConfig = {
        folder: 'ph-health-care/documents/invoices',
        resource_type: 'raw',
        public_id: `prescription_${appointment.payment?.id}`
      }

      const { secure_url } = await uploadPdfBufferToCloudinary(invoicePdfBuffer, "Invoice", cloudInaryConfig)
      if (!secure_url) {
        throw new AppError("failed to upload prescription pdf buffer in cloudinary", status.BAD_REQUEST)

      }


      await prisma.payment.update({
        where: {
          id: appointment.payment?.id!
        }, data: {
          invoiceUrl: secure_url
        }
      })
      await emailQueue.add("payment-succces", {...invoicePdfPayload,invoiceUrl:secure_url})
      console.log(`Processed checkout.session.completed for appointment ${appointmentId} and payment ${paymentId}`);
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object

      console.log(`Checkout session ${session.id} expired. Marking associated payment as failed.`);
      throw new AppError(`Checkout session ${session.id} expired. Marking associated payment as failed.`)


    }
    case "payment_intent.payment_failed": {
      const session = event.data.object
      console.log(`Payment intent ${session.id} failed. Marking associated payment as failed.`);
      throw new AppError(`Payment intent ${session.id} failed. Marking associated payment as failed.`, 400)
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return { message: `Webhook Event ${event.id} processed successfully` }

})

export const stripeControllers = { handleStripeWebHookEventController }