import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
// If your Prisma file is located elsewhere, you can change the path
import { bearer } from "better-auth/plugins";
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    trustedOrigins:[
        "http://localhost:3000",
        "https://postella-beta.vercel.app",
        "https://nuance-daily.vercel.app",
        
        
    ],
    plugins: [bearer(),

    ],

    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true,
       
    },

    
    



});
