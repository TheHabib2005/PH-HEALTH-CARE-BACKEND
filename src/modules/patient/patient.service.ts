import { prisma } from "../../lib/prisma";
import { IUpdatePatientProfilePayload } from "./patient.interface";

const updatePatientProfile = async (
  idOrUserId: string,
  payload: IUpdatePatientProfilePayload,
  loggedUserEmail:string
) => {
  return await prisma.$transaction(async (tx) => {

    // 1️⃣ Check patient exists (Support lookup by id or userId)
    const existingPatient = await tx.patient.findFirst({
      where: {
        OR: [
          { id: idOrUserId },
          { userId: idOrUserId }
        ]
      },
      include: {
        user: true,
        patientHealthData: true
      }
    });

    if (!existingPatient) {
      throw new Error("Patient not found");
    }
       if(loggedUserEmail !== existingPatient.email){
      throw new Error("you cannot update other Patient profle");

       }

    const actualPatientId = existingPatient.id;

    if(payload.patientData){
            await tx.patient.update({
                where : {
                    id : existingPatient.id
                },
                data : {
                    ...payload.patientData
                }
            });

            if(payload.patientData.name || payload.patientData.profilePhoto){
                const userData = {
                    name : payload.patientData.name ? payload.patientData.name : existingPatient.name,
                    image : payload.patientData.profilePhoto ? payload.patientData.profilePhoto : existingPatient.profilePhoto,
                }
                await tx.user.update({
                    where: {
                        id: existingPatient.userId
                    },
                    data: {
                        ...userData
                    }
                });
            };

            
        }

    // 4️⃣ Upsert Health Data
    if (
      payload.patientHealthData &&
      Object.keys(payload.patientHealthData).length > 0
    ) {
      await tx.patientHealthData.upsert({
        where: { patientId: actualPatientId },
        update: payload.patientHealthData,
        create: {
          ...payload.patientHealthData,
          patientId: actualPatientId
        } as any
      });
    }

    // 5️⃣ Create Medical Reports
          if(payload.medicalReports && Array.isArray(payload.medicalReports) && payload.medicalReports.length > 0){
            for (const report of payload.medicalReports){
                if(report.shouldDelete && report.reportId){
                    const deletedReport = await tx.medicalReport.delete({
                        where : {
                            id : report.reportId,
                        }
                    });

                    if(deletedReport.reportLink){
                        // await deleteFileFromCloudinary(deletedReport.reportLink);
                    }
                }else if(report.reportName && report.reportLink){
                    await tx.medicalReport.create({
                        data : {
                            patientId :existingPatient.id ,
                            reportName : report.reportName,
                            reportLink : report.reportLink,
                        }
                    });
                }
            }
        }

    // 6️⃣ Return updated profile
    return await tx.patient.findUnique({
      where: { id: actualPatientId },
      include: {
        user: true,
        patientHealthData: true,
        medicalReports: true
      }
    });
  }, {
    maxWait: 5000,
    timeout: 10000
  });
};

export const PatientServices = {
  updatePatientProfile
};