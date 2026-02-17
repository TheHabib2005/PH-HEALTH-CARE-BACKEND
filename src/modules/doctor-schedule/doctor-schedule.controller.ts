import { Request, Response } from "express";
import status from "http-status";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { doctorScheduleServices } from "./doctor-schedule.service";

// -------------------- CREATE DOCTOR SCHEDULE --------------------
const createDoctorSchedule = asyncHandler(async (req: Request, res: Response) => {
    const result = await doctorScheduleServices.createDoctorSchedule(req.body);

    return sendSuccess(res, {
        statusCode: status.CREATED,
        message: "Doctor schedule created successfully",
        data: result,
    });
});

// -------------------- GET DOCTOR SCHEDULES BY DOCTOR ID --------------------
const getDoctorSchedules = asyncHandler(async (req: Request, res: Response) => {
    const { doctorId } = req.params;

    const result = await doctorScheduleServices.getDoctorSchedules(doctorId as string);

    return sendSuccess(res, {
        statusCode: status.OK,
        message: "Doctor schedules fetched successfully",
        data: result,
    });
});

// -------------------- GET ALL DOCTOR SCHEDULES --------------------
const getAllDoctorSchedules = asyncHandler(async (req: Request, res: Response) => {
    const result = await doctorScheduleServices.getAllDoctorSchedules();

    return sendSuccess(res, {
        statusCode: status.OK,
        message: "All doctor schedules fetched successfully",
        data: result,
    });
});

// -------------------- DELETE DOCTOR SCHEDULE --------------------
const deleteDoctorSchedule = asyncHandler(async (req: Request, res: Response) => {
    const { doctorId, scheduleId } = req.params;

    const result = await doctorScheduleServices.deleteDoctorSchedule(
        doctorId as string,
        scheduleId as string
    );

    return sendSuccess(res, {
        statusCode: status.OK,
        message: "Doctor schedule deleted successfully",
        data: result,
    });
});

export const doctorScheduleControllers = {
    createDoctorSchedule,
    getDoctorSchedules,
    getAllDoctorSchedules,
    deleteDoctorSchedule,
};
