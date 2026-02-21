// payload 

import { BloodGroup, Gender } from "../../generated/prisma/enums";
import { IRequestUser, IUpdateUser } from "../auth/auth.interface";


export interface IUpdatePatientPayload {
    name?: string
    contactNumber?: string
    address?: string
    profilePhoto?: string

}


export interface IUpdatePatientHealthData {
    patientId:string
    dateOfBirth: Date
    gender: Gender
    bloodGroup: BloodGroup
    hasAllergies: boolean
    hasDiabetes: boolean
    height: number
    weight: number
    smokingStatus: boolean
    dietaryPreference: string
    pregnancyStatus: boolean
}

export interface ICreateMedicalReport{
    reportId :string
    patientId :string
    reportName:string
    reportLink:string
    shouldDelete:boolean
}

export interface IUpdatePatientProfilePayload {
    // user feild - base user
  userData: IUpdateUser
    // patient feild -- patient model
    patientData: IUpdatePatientPayload
    // health data - patient health data 
    patientHealthData: IUpdatePatientHealthData

    // medical reports - patient medical reports

    medicalReports:ICreateMedicalReport[]

}

