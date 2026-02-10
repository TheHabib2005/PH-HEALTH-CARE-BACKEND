import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { IcreateSpecialtyPayload, SpecialityType } from "./specialty.interface";


const createSpeciality = async (payload:IcreateSpecialtyPayload):Promise<SpecialityType>=>{
       const isExistSpeciality = await prisma.specialty.findUnique({
        where:{
            title:payload.title
        }
       });

       if(isExistSpeciality){
        throw new AppError(`speciality alreday exist with this title=${payload.title} `,400)
       }

       const newSpeciality = await prisma.specialty.create({
        data:payload
       });

       if(!newSpeciality.id){
        throw new AppError(`Failed to create Speciality `,400)
       }

       return newSpeciality

       

}

const getAllSpecialties = async (): Promise<SpecialityType[]> => {

    const specialties = await prisma.specialty.findMany();
    return specialties;
}

const deleteSpecialty = async (id: string): Promise<SpecialityType> => {

    const specialty = await prisma.specialty.delete({
        where: { id }
    })

    return specialty;
}



export const specialityServices = {
  createSpeciality,
  deleteSpecialty,
  getAllSpecialties
}