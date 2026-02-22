import { Worker } from "bullmq"
import { redis } from "../config/redis"
import { mailServices } from "../utils/mailServices";
import ejs from "ejs"
const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    const { user, verifyLink } = job.data;
    switch (job.name) {
      case "prescription-email":
        const prescriptionData = job.data;

        const prescriptionTemplate = `${process.cwd()}/src/templates/prescription-email.ejs`

        // 3. Render the HTML
        const prescriptionHtmlContent = await ejs.renderFile(prescriptionTemplate,
          prescriptionData
        );

        await mailServices.sendMail({
          email: prescriptionData.patientEmail,
          name: prescriptionData.patientName,
          type: "prescription-email",
          html: prescriptionHtmlContent
        })

        break;
      case "verification-mail":
        await mailServices.sendMail({
          email: user.email,
          name: user.name,
          link: verifyLink, type: "verify"
        })
        break;
      case "reset-password-mail":
        await mailServices.sendMail({
          email: user.email,
          name: user.name,
          link: verifyLink,
          type: "reset"
        })
        break;

        case "payment-succces":



        const paymentData = job.data;

          const paymentTemplatePath = `${process.cwd()}/src/templates/payment.ejs`

        // 3. Render the HTML
        const paymentHtmlContent = await ejs.renderFile(paymentTemplatePath,
          paymentData
        );
          await mailServices.sendMail({
          email: paymentData.patientEmail,
          type: "payment-succces",
          html:paymentHtmlContent
        })
        break

      default:
        break;
    }
  },
  { connection: redis }
);

emailWorker.on("completed", (job) => console.log(`✅ Job ${job.id} completed`));
emailWorker.on("failed", (job, err) =>
  console.error(`❌ Job ${job?.id} failed:`, err)
);

export default emailWorker