

import { Router } from "express";
import { authMiddleware, roleMiddleware } from "../../middleware/auth-middlewares";
import { validateRequest } from "../../middleware/validateRequest";
import { specialitySchemas } from "./specialty.schema";
import { specialityControllers } from "./specialty.controller";



const specialityRouter: Router = Router();

specialityRouter.post(
  "/",
 authMiddleware,
 roleMiddleware(["ADMIN"]),
 validateRequest(specialitySchemas.createSpecialitySchema),
 specialityControllers.createSpecialityController
);

specialityRouter.get(
  "/",
 specialityControllers.getAllSpecialties
);

specialityRouter.delete(
  "/:id",
 authMiddleware,
 roleMiddleware(["ADMIN"]),
 specialityControllers.deleteSpecialty
);


export default specialityRouter;
