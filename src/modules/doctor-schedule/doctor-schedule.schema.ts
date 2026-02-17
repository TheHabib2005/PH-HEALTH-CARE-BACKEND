import { z } from "zod";

const createDoctorScheduleZodSchema = z.object({
    body: z.object({
        doctorId: z.string({ required_error: "Doctor ID is required" }),
        scheduleIds: z
            .array(z.string({ required_error: "Schedule ID is required" }))
            .min(1, "At least one schedule ID is required"),
    })
});

export const doctorScheduleSchemas = { createDoctorScheduleZodSchema };
