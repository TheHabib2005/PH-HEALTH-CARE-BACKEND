import { Request, Response } from "express";
import { auth } from "../../lib/auth";
import { AppError } from "../../utils/AppError";
import type { LoginPayload, RegisterPayload } from "./types";

// -------------------- REGISTER --------------------
const registerUser = async (payload: RegisterPayload) => {

  const { user } = await auth.api.signUpEmail({
    body: payload
  })
  return { user };
};

// -------------------- LOGIN --------------------
const loginUser = async (payload: LoginPayload) => {
  const response = await auth.api.signInEmail({
    body: payload,
    asResponse: true,
  });
  return response
};
// -------------------- LOGIN --------------------
const getUserProfile = async (res:Response) => {


  const response = res.locals.user;


  return response
};

export const authServices = { registerUser, loginUser, getUserProfile };
