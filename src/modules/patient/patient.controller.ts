import { Request, Response } from "express";
import { PatientServices } from "./patient.service";

const updatePatientProfile = async (
  req: Request,
  res: Response
) => {
  try {
    const patientId = req.params.id as string
    const payload = req.body;
const loggedUserEmail = res.locals.auth.email
 

    const result = await PatientServices.updatePatientProfile(
      patientId,
      payload,
      loggedUserEmail
    );

    return res.status(200).json({
      success: true,
      message: "Patient profile updated successfully",
      data: result
    });

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong"
    });
  }
};

export const PatientControllers = {
  updatePatientProfile
};