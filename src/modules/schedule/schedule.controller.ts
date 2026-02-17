import { Request, Response } from "express";
import status from "http-status";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { scheduleServices } from "./schedule.service";

// -------------------- CREATE SCHEDULE --------------------
const createSchedule = asyncHandler(async (req: Request, res: Response) => {
    const result = await scheduleServices.createSchedule(req.body);

    return sendSuccess(res, {
        statusCode: status.CREATED,
        message: "Schedule created successfully",
        data: result,
    });
});

// -------------------- GET ALL SCHEDULES --------------------
const getAllSchedules = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
    };

    const result = await scheduleServices.getAllSchedules(filters);

    return sendSuccess(res, {
        statusCode: status.OK,
        message: "Schedules fetched successfully",
        data: result,
    });
});

// -------------------- GET SCHEDULE BY ID --------------------
const getScheduleById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await scheduleServices.getScheduleById(id as string);

    return sendSuccess(res, {
        statusCode: status.OK,
        message: "Schedule fetched successfully",
        data: result,
    });
});

// -------------------- DELETE SCHEDULE --------------------
const deleteSchedule = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await scheduleServices.deleteSchedule(id as string);

    return sendSuccess(res, {
        statusCode: status.OK,
        message: "Schedule deleted successfully",
        data: result,
    });
});

export const scheduleControllers = {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    deleteSchedule,
};
