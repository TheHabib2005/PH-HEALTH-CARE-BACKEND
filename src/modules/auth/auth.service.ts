import { Request, Response } from "express";
import { auth } from "../../lib/auth";
import { AppError } from "../../utils/AppError";
import type { ILoginUserPayload, IRegisterPayload, IRequestUser,  } from "./user.interface";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { UserStatus } from "../../generated/prisma/enums";
import status from "http-status"
// -------------------- REGISTER --------------------
const registerPatient = async (payload: IRegisterPayload):Promise<any> =>  {

  const { user } = await auth.api.signUpEmail({
    body: payload
  });
try {

    const patient = await prisma.$transaction(async(tx)=>{
      const patientTx = await tx.patient.create({
        data:{
          name:user.name,
          email:user.email,
          userId:user.id
        }
      });
      return patientTx
  })

    const accessToken = tokenUtils.getAccessToken({
            userId: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            status: user.status,
            isDeleted: user.isDeleted,
            emailVerified: user.emailVerified,
        });

        const refreshToken = tokenUtils.getRefreshToken({
            userId: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            status: user.status,
            isDeleted: user.isDeleted,
            emailVerified: user.emailVerified,
        });

  return { 
    user,
    patient,
accessToken,
refreshToken
   };} catch (error) {
    console.log("failed to register patient");
    
          await prisma.user.delete({
            where: {
                id: user.id
            }
        })
        throw error;
}
};

// -------------------- LOGIN --------------------
// send cookie with better auth
// const loginUser = async (payload: LoginPayload):Promise<any> => {
//   const response = await auth.api.signInEmail({
//     body: payload,
//     asResponse: true,
//   });
  
// };

const loginUser = async (payload: ILoginUserPayload) => {
    const { email, password } = payload;

    const data = await auth.api.signInEmail({
        body: {
            email,
            password,
        }
    })

    if (data.user.status === UserStatus.BANNED) {
        throw new AppError( "User is blocked",status.FORBIDDEN);
    }

    if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
        throw new AppError("User is deleted",status.NOT_FOUND);
    }



    const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    });

    return {
        ...data,
        accessToken,
        refreshToken,
    };

}

// -------------------- PROFILE --------------------


const getUserProfile = async (user : IRequestUser) => {
    const isUserExists = await prisma.user.findUnique({
        where : {
            id : user.userId,
        },
        include : {
            patient : {
                include : {
                    appointment : true,
                    reviews : true,
                    prescription : true,
                    medicalReports : true,
                    patientHealthData : true,
                }
            },
            doctor : {
                include : {
                    specialty : true,
                    appoinments : true,
                    reviews : true,
                    prescriptions : true,
                }
            },
            admin : true,
        }
    })

    if (!isUserExists) {
        throw new AppError("User not found",status.NOT_FOUND);
    }

    return isUserExists;
}

export const authServices = { registerPatient, loginUser, getUserProfile };
