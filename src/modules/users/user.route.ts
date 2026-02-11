import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { userZodSchemas } from "./user.schema";
import { userControllers } from "./user.controller";
import { authMiddleware, roleMiddleware } from "../../middleware/auth-middlewares";
import { UserRole } from "../../generated/prisma/enums";

const router: Router = Router();

router.post(
  "/create-doctor",
  authMiddleware,
  roleMiddleware(["SUPER_ADMIN","ADMIN"]),
  validateRequest(userZodSchemas.createDoctorZodSchema),
  userControllers.createDoctorController
);

router.post(
  "/create-admin",
  authMiddleware,
  roleMiddleware(["SUPER_ADMIN"]),
  validateRequest(userZodSchemas.createAdminZodSchema),
  userControllers.createAdminController
);





export default router;
