import { z } from "zod";

const createScheduleZodSchema = z.object({
    body: z.object({
        startDate: z.string({ required_error: "Start date is required" }),
        endDate: z.string({ required_error: "End date is required" }),
        startTime: z.string({ required_error: "Start time is required" }),
        endTime: z.string({ required_error: "End time is required" }),
    })
});

export const scheduleSchemas = { createScheduleZodSchema };
