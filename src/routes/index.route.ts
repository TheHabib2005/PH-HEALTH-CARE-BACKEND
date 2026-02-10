import { Router } from "express";
import authRouter from "../modules/auth/auth.route"
import specialityRouter from "../modules/specialty/specialty.route"
const indexRouter = Router();
indexRouter.use("/auth",authRouter)
indexRouter.use("/speciality",specialityRouter)

export default indexRouter