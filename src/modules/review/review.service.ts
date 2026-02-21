import status from "http-status";
import { PaymentStatus, UserRole } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { appointmentServices } from "../appointment/appointment.service";
import { IRequestUser } from "../auth/auth.interface";
import { ICreateReviewPayload, IUpdateReviewPayload } from "./review.interface";


const createReview = async (user: IRequestUser, reviewPayload: ICreateReviewPayload) => {

    //check patient exist 

    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email
        }
    });

    // check exist appointment 
    const appoinment = await appointmentServices.getAppointmentById(reviewPayload.appointmentId);


    // validate status 

    if (appoinment.paymentStatus !== PaymentStatus.COMPLETE) {
        throw new AppError("You can only review after payment is done", status.BAD_REQUEST);
    };

    if (appoinment.patientId !== patientData.id) {
        throw new AppError("You can only review for your own appointments", status.BAD_REQUEST);
    };

    // handle dupliacte review
    const isReviewed = await prisma.review.findFirst({
        where: {
            appointmentId: reviewPayload.appointmentId
        }
    });

    if (isReviewed) {
        throw new AppError("You have already give review on this appointment. You can update your review instead.", status.BAD_REQUEST);
    };


    // create a review and get avg rating and update doctor profile

    const result = await prisma.$transaction(async (ctx) => {

        const newReview = await ctx.review.create({
            data: {
                comment: reviewPayload.comment,
                rating: reviewPayload.rating,
                doctorId: appoinment.doctorId,
                patientId: appoinment.patientId,
                appointmentId: appoinment.id,
            }
        });
           // calculate avg rating
        const getAvgRating = await ctx.review.aggregate({
            where:{
                appointmentId:reviewPayload.appointmentId
            },
            _avg:{
                rating:true
            }
        });

        // update doctor profile
        const updatedDoctor = await ctx.doctor.update({
            where:{
                id:newReview.doctorId
            },
            data:{
                averageRating:getAvgRating._avg.rating!
            }
        })


  return newReview

    })

    return result




}



const getAllReviews = async (
) => {
    const reviews = await prisma.review.findMany({
        include: {
            doctor: true,
            patient: true,
            appointment: true
        }
    });

    return reviews;
};

const myReviews = async (user: IRequestUser) => {
    const isUserExist = await prisma.user.findUnique({
        where: {
            email: user?.email
        }
    });
    if (!isUserExist) {
        throw new AppError( "Only patients can view their reviews",status.BAD_REQUEST);
    }

    if (isUserExist.role === UserRole.DOCTOR) {
        const doctorData = await prisma.doctor.findUniqueOrThrow({
            where: {
                email: user?.email
            }
        });
        return await prisma.review.findMany({
            where: {
                doctorId: doctorData.id
            },
            include: {
                patient: true,
                appointment: true
            }
        });
    }

    if (isUserExist.role === UserRole.PATIENT) {
        const patientData = await prisma.patient.findUniqueOrThrow({
            where: {
                email: user?.email
            }
        });
        return await prisma.review.findMany({
            where: {
                patientId: patientData.id
            },
            include: {
                doctor: true,
                appointment: true
            }
        });
    }
};

const updateReview = async (user: IRequestUser, reviewId: string, payload: IUpdateReviewPayload) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    });
    const reviewData = await prisma.review.findUniqueOrThrow({
        where: {
            id: reviewId
        }
    });
    if (!(patientData.id === reviewData.patientId)) {
        throw new AppError( "This is not your review!",status.BAD_REQUEST)
    }
    const result = await prisma.$transaction(async (tx) => {
        const updatedReview = await tx.review.update({
            where: {
                id: reviewId
            },
            data: {
                ...payload
            }
        });

        const averageRating = await tx.review.aggregate({
            where: {
                doctorId: reviewData.doctorId
            },
            _avg: {
                rating: true
            }
        });

        await tx.doctor.update({
            where: {
                id: updatedReview.doctorId
            },
            data: {
                averageRating: averageRating._avg.rating as number
            }
        })

        return updatedReview;
    });

    return result;
}

const deleteReview = async (user: IRequestUser, reviewId: string) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    });
    const reviewData = await prisma.review.findUniqueOrThrow({
        where: {
            id: reviewId
        }
    });
    if (!(patientData.id === reviewData.patientId)) {
        throw new AppError( "This is not your review!",status.BAD_REQUEST)
    }

    const result = await prisma.$transaction(async (tx) => {
        const deletedReview = await tx.review.delete({
            where: {
                id: reviewId
            }
        });

        const averageRating = await tx.review.aggregate({
            where: {
                doctorId: deletedReview.doctorId
            },
            _avg: {
                rating: true
            }
        });

        await tx.doctor.update({
            where: {
                id: deletedReview.doctorId
            },
            data: {
                averageRating: averageRating._avg.rating as number
            }
        })
        return deletedReview;
    });

    return result;
}



export const reviewServices = {
    createReview,
    getAllReviews,
    myReviews,
    updateReview,
    deleteReview
}