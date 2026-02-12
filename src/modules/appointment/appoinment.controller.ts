import { Request, Response } from "express";
import status from "http-status";

import { AppError } from "../../utils/AppError";
import { asyncHandler } from "../../utils/asyncHandler";
import { appointmentServices } from "./appointment.service";
import { sendSuccess } from "../../utils/apiResponse";



const getAllAppointments = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await appointmentServices.getAllAppointments();

    sendSuccess(res, {
      statusCode: status.OK,
      message: "Appointments fetched successfully",
      data: result,
    });
  }
);


const getAppointmentById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError("Appointment ID is required", status.BAD_REQUEST);
    }

    const result = await appointmentServices.getAppointmentById(id as string);

    sendSuccess(res, {
      statusCode: status.OK,
      message: "Appointment fetched successfully",
      data: result,
    });
  }
);


const createAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    const payload = req.body;

    const result = await appointmentServices.createAppointment(payload);

    sendSuccess(res, {
      statusCode: status.CREATED,
      message: "Appointment created successfully",
      data: result,
    });
  }
);


const cancelAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError("Appointment ID is required", status.BAD_REQUEST);
    }

    const result = await appointmentServices.cancelAppointment(id as string);

    sendSuccess(res, {
      statusCode: status.OK,
      message: "Appointment cancelled successfully",
      data: result,
    });
  }
);

export const AppointmentController = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  cancelAppointment,
};
