import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import {authServices} from "../../../src/modules/auth/auth.service"
import app from "../../../src/app"

describe("POST /api/auth/register", () => {
  
  it("should register a user", async () => {
    vi.spyOn(authServices, "registerUser")
      .mockImplementation(async (payload) => {
        return payload
      });
    const payload = {
          name:"habib",
      email: "test@mail.com",
      password: "123456",
    };
    const res = await request(app)
      .post("/api/auth/register")
      .send(payload);

    // ✅ ASSERT SERVICE CALLED WITH PAYLOAD
    expect(authServices.registerUser).toHaveBeenCalledWith(payload);

    // ✅ ASSERT API RESPONSE
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Account Created Successfully")
  });
});
