import { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler"
import { specialityServices } from "./specialty.service"

const createSpecialityController = asyncHandler(async (req, res) => {
    const speciality = await specialityServices.createSpeciality(req.body);
    return sendSuccess(res, {
        statusCode: 201,
        data: speciality,
        message: "Speciality created successfully"
    })
})

const getAllSpecialties = asyncHandler(
    async (req, res) => {
        const result = await specialityServices.getAllSpecialties();
        sendSuccess(res, {
            statusCode: 200,
            message: 'Specialties fetched successfully',
            data: result
        });
    }
)

const deleteSpecialty = asyncHandler(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await specialityServices.deleteSpecialty(id as string);
        sendSuccess(res, {
            statusCode: 200,
            message: 'Specialty deleted successfully',
            data: result
        });
    }
)


export const specialityControllers = {
    createSpecialityController,

    getAllSpecialties, deleteSpecialty
}