import { z } from "zod";

const createReviewSchema = z.object({
  body: z.object({
    appointmentId: z.string({
      required_error: "Appointment ID is required",
    }),
    rating: z.number()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5"),
    comment: z.string({
      required_error: "Comment is required",
    }),
  }),
});

const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5).optional(),
    comment: z.string().optional(),
  }),
});

export const ReviewValidation = {
  createReviewSchema,
  updateReviewSchema,
};