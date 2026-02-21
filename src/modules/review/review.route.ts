import express from "express";
import { UserRole } from "../../generated/prisma/enums";

import { reviewsControllers } from "./review.controller";
import { authMiddleware, roleMiddleware } from "../../middleware/auth-middlewares";
import { validateRequest } from "../../middleware/validateRequest";
import { ReviewValidation } from "./review.validate";

const ReviewRoutes = express.Router();

// Get all reviews (Usually for Admin or Public view)
ReviewRoutes.get("/", reviewsControllers.getAllReviewsController);

// Get logged-in user's reviews (Doctor sees reviews for them, Patients see reviews they gave)
ReviewRoutes.get(
    "/my-reviews",
    authMiddleware,roleMiddleware([UserRole.PATIENT]),
    reviewsControllers.getMyReviewsController
);

// Create a new review (Patient Only)
ReviewRoutes.post(
    "/create-review",
    authMiddleware,roleMiddleware([UserRole.PATIENT]),
    validateRequest(ReviewValidation.createReviewSchema),
    reviewsControllers.createReviewController
);

// Update a review (Patient Only)
ReviewRoutes.patch(
    "/:id",
   authMiddleware,roleMiddleware([UserRole.PATIENT]),
    validateRequest(ReviewValidation.updateReviewSchema),
    reviewsControllers.updateReviewController
);

// Delete a review (Patient Only)
ReviewRoutes.delete(
    "/:id",
    authMiddleware,roleMiddleware([UserRole.PATIENT]),
    reviewsControllers.deleteReviewController
);

export default ReviewRoutes