import express from "express";
import { scheduleControllers } from "./schedule.controller";
import { authMiddleware, roleMiddleware } from "../../middleware/auth-middlewares";
import { validateRequest } from "../../middleware/validateRequest";
import { scheduleSchemas } from "./schedule.schema";

const router = express.Router();

router.post("/",
    authMiddleware,
    roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
    validateRequest(scheduleSchemas.createScheduleZodSchema),
    scheduleControllers.createSchedule
);

router.get("/",
    authMiddleware,
    scheduleControllers.getAllSchedules
);

router.get("/:id",
    authMiddleware,
    scheduleControllers.getScheduleById
);

router.delete("/:id",
    authMiddleware,
    roleMiddleware(["ADMIN", "SUPER_ADMIN"]),
    scheduleControllers.deleteSchedule
);

export default router;
