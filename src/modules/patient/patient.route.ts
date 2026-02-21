import express from "express";
import { PatientControllers } from "./patient.controller";
import { authMiddleware, roleMiddleware } from "../../middleware/auth-middlewares";
import { validateRequest } from "../../middleware/validateRequest";
import { patientSchemas } from "./patient.validate";

const patientRouter = express.Router();

patientRouter.put("/:id",authMiddleware,roleMiddleware(["PATIENT"]),validateRequest(patientSchemas.updatePatientProfileSchema), PatientControllers.updatePatientProfile);

export default patientRouter