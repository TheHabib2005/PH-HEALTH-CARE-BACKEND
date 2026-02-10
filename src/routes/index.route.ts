import { Router } from "express";
import authRouter from "../modules/auth/auth.route"
import specialityRouter from "../modules/specialty/specialty.route"
import usersRouter from "../modules/users/user.route"
const indexRouter = Router();
indexRouter.use("/auth",authRouter)
indexRouter.use("/speciality",specialityRouter)
indexRouter.use("/users",usersRouter)

export default indexRouter