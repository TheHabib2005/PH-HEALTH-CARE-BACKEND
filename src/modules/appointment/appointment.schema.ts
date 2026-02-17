import { z } from "zod";

const createAppointmentZodSchema = z.object({
    body: z.object({
        doctorId: z.string({ required_error: "Doctor ID is required" }),
        patientId: z.string({ required_error: "Patient ID is required" }),
        scheduleId: z.string({ required_error: "Schedule ID is required" })
    })
});

const updateAppointmentStatusZodSchema = z.object({
    body: z.object({
        status: z.enum(["PENDING", "SCHEDULED", "COMPLETED", "CANCELLED"], {
            required_error: "Status is required",
        }),
    })
});

export const appointmentSchemas = {
    createAppointmentZodSchema,
    updateAppointmentStatusZodSchema,
};
