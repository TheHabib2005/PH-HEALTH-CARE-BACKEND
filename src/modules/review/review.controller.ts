import { Request, Response } from "express";
import status from "http-status";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { reviewServices } from "./review.service";

const createReviewController = asyncHandler(async (req: Request, res: Response) => {
    const user = res.locals.auth;
    const result = await reviewServices.createReview(user, req.body);
    sendSuccess(res, {
        statusCode: status.CREATED,
        message: "Review created successfully",
        data: result,
    });
});

const getAllReviewsController = asyncHandler(async (req: Request, res: Response) => {
    const result = await reviewServices.getAllReviews();
    sendSuccess(res, {
        statusCode: status.OK,
        message: "Reviews fetched successfully",
        data: result,
    });
});

const getMyReviewsController = asyncHandler(async (req: Request, res: Response) => {
    const user = res.locals.auth;
    const result = await reviewServices.myReviews(user);
    sendSuccess(res, {
        statusCode: status.OK,
        message: "My reviews fetched successfully",
        data: result,
    });
});

const updateReviewController = asyncHandler(async (req: Request, res: Response) => {
    const user = res.locals.auth;
    const { id } = req.params
    const result = await reviewServices.updateReview(user, id as string , req.body);
    sendSuccess(res, {
        statusCode: status.OK,
        message: "Review updated successfully",
        data: result,
    });
});

const deleteReviewController = asyncHandler(async (req: Request, res: Response) => {
    const user = res.locals.auth;
    const { id } = req.params;
    const result = await reviewServices.deleteReview(user, id as string);
    sendSuccess(res, {
        statusCode: status.OK,
        message: "Review deleted successfully",
        data: result,
    });
});

export const reviewsControllers = {
    createReviewController,
    getAllReviewsController,
    getMyReviewsController,
    updateReviewController,
    deleteReviewController
};