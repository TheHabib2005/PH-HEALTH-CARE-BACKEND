import express from "express";
import { doctorScheduleControllers } from "./doctor-schedule.controller";
import { authMiddleware, roleMiddleware } from "../../middleware/auth-middlewares";
import { validateRequest } from "../../middleware/validateRequest";
import { doctorScheduleSchemas } from "./doctor-schedule.schema";

const router = express.Router();

router.post("/",
    authMiddleware,
    roleMiddleware(["DOCTOR", "ADMIN", "SUPER_ADMIN"]),
    validateRequest(doctorScheduleSchemas.createDoctorScheduleZodSchema),
    doctorScheduleControllers.createDoctorSchedule
);

router.get("/",
    authMiddleware,
    roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
    doctorScheduleControllers.getAllDoctorSchedules
);

router.get("/:doctorId",
    authMiddleware,
    doctorScheduleControllers.getDoctorSchedules
);

router.delete("/:doctorId/:scheduleId",
    authMiddleware,
    roleMiddleware(["DOCTOR", "ADMIN", "SUPER_ADMIN"]),
    doctorScheduleControllers.deleteDoctorSchedule
);

export default router;
