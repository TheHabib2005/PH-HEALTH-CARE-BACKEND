import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authServices } from "./auth.service";
import { sendSuccess } from "../../utils/apiResponse";
import { auth } from "../../lib/auth";

// -------------------- REGISTER --------------------
const registerController = asyncHandler(async (req: Request, res: Response) => {
      const {name,email,password} = req.body;

      const {user} = await authServices.registerUser({
        name,email,password
      })

      return sendSuccess(res,{
        data:user,
        message:"Account Created Successfully"
      })
});

// -------------------- LOGIN --------------------
const loginController = asyncHandler(async (req: Request, res: Response) => {
      const {email,password} = req.body;
;

  const response = await authServices.loginUser({email,password})
  const setCookie = response.headers.get("set-cookie");

  if (setCookie) {
    res.setHeader("set-cookie", setCookie);
  }

  // 4. Return the user/data as JSON
  const data = await response.json();
 return sendSuccess(res,{
    data,
    message:"your are LoggedIn Sucessfully"
 })
});
// -------------------- LOGIN --------------------
const getUserProfileController = asyncHandler(async (req: Request, res: Response) => {

    const user = await authServices.getUserProfile(res)
      return sendSuccess(res,{
        data:user,
        message:"Profile Data fetch Successfully"
      })
});

export const authControllers = { registerController, loginController,getUserProfileController };
