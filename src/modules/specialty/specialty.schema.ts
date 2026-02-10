import { z } from "zod";

const createSpecialitySchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: "Title is required" })
      .min(5, "Title must be at least 5 characters long"),

    description: z
      .string()
      .min(5, "Description must be at least 5 characters long")
      .optional(),

    icon: z
      .string({ required_error: "Speciality icon is required" })
      .min(1, "Speciality icon is required")
      .optional()
  }),
});

export const specialitySchemas = { createSpecialitySchema };