import { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler"
import { userServices } from "./user.service";


const createDoctorController = asyncHandler(async (req, res) => {
  
    const doctor = await  userServices.createDoctor(req.body);

    return sendSuccess(res, {
        statusCode: 201,
        data: doctor,
        message: "Doctor Profile created successfully"
    })
})

const createAdminController = asyncHandler(
    async (req, res) => {
     const admin = await  userServices.createAdmin(req.body);

    return sendSuccess(res, {
        statusCode: 201,
        data: admin,
        message: "Admin Profile created successfully"
    })
    }
)




export const userControllers = {
    createDoctorController,

    createAdminController
}