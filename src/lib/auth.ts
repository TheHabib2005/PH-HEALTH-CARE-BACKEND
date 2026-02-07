import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
// If your Prisma file is located elsewhere, you can change the path
import { bearer } from "better-auth/plugins";
import { UserRole, UserStatus } from "../generated/prisma/enums";

const isProduction = process.env.NODE_ENV === "production";
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),
    trustedOrigins: [
        "http://localhost:3000",
    ],
    plugins: [bearer(),
    ],
    user: {
        additionalFields: {

            role: {
                type: "string",
                required: true,
                defaultValue: UserRole.PATIENT
            },
            status: {
                type: "string",
                required: true,
                defaultValue: UserStatus.ACTIVE
            },
            needPasswordChange: {
                type: "boolean",
                defaultValue: false
            },
            isDeleted: {
                type: "boolean",
                defaultValue: false
            },

        }
    },

    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true,
    },

    advanced: {
        defaultCookieAttributes: {
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction, // secure in production
            httpOnly: true,
        },
        trustProxy: true,
        cookies: {
            state: {
                attributes: {
                    sameSite: "none",
                    secure: true,
                },
            },
        },
    }




});
