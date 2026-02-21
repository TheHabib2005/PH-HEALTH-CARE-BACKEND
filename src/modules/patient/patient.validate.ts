import { z } from "zod";
import { BloodGroup, Gender } from "../../generated/prisma/enums";

const updatePatientProfileSchema = z.object({
  body: z.object({

    // 1️⃣ userData → Pick<IUpdateUser, "name">
    userData: z.object({
      name: z
        .string()
        .min(2, "Name must be at least 2 characters long"),
    }).optional(),

    // 2️⃣ patientData → IUpdatePatientPayload
    patientData: z.object({
      name: z
        .string()
        .min(2, "Name must be at least 2 characters long")
        .optional(),
      profilePhoto: z
        .string()
        .optional(),
      contactNumber: z
        .string()
        .min(6, "Contact number is too short")
        .optional(),
      address: z
        .string()
        .min(3, "Address must be at least 3 characters")
        .optional(),
    }).optional(),

    // 3️⃣ patientHealthData → IUpdatePatientHealthData
    patientHealthData: z.object({
      patientId: z
        .string()
        .min(1, "Patient ID is required").optional(),

      dateOfBirth: z.coerce.date({
        required_error: "Date of birth is required",
      }),

      gender: z.nativeEnum(Gender, {
        errorMap: () => ({ message: "Invalid gender value" }),
      }),

      bloodGroup: z.nativeEnum(BloodGroup, {
        errorMap: () => ({ message: "Invalid blood group value" }),
      }),

      hasAllergies: z.boolean({
        required_error: "Allergy status is required",
      }),

      hasDiabetes: z.boolean({
        required_error: "Diabetes status is required",
      }),

      height: z
        .number()
        .positive("Height must be positive"),

      weight: z
        .number()
        .positive("Weight must be positive"),

      smokingStatus: z.boolean(),

      dietaryPreference: z
        .string()
        .min(2, "Dietary preference is required"),

      pregnancyStatus: z.boolean(),
    }).optional(),

    // 4️⃣ medicalReports → ICreateMedicalReport[]
    medicalReports: z.array(
      z.object({
        reportId: z
          .string()
          .min(1, "report  ID is required").optional(),
        patientId: z
          .string()
          .min(1, "Patient ID is required").optional(),
        shouldDelete: z
          .boolean()
          .optional(),

        reportName: z
          .string()
          .min(2, "Report name is required"),

        reportLink: z
          .string()
          .url("Please provide a valid report URL"),
      })
    ).optional(),
  }),
});

export const patientSchemas = {
  updatePatientProfileSchema,
};