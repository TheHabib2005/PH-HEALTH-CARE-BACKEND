import { Prisma } from "../generated/prisma/client";

export const handlePrismaError = (error: any) => {
    let statusCode = 400;
    let message = "Database Error";

    // most common errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                message = `Duplicate field value: ${error.meta?.target}`;
                break;
            case 'P2003':
                message = "Foreign key constraint failed. Check if the related data exists.";
                break;
            case 'P2025':
                statusCode = 404;
                message = (error.meta?.cause as string) || "Record not found!";
                break;
            case 'P2000':
                message = "The provided value is too long for this field.";
                break;
            default:
                message = `Prisma Error: ${error.code}`;
        }
    } 
    // validation error
    else if (error instanceof Prisma.PrismaClientValidationError) {
        message = "Validation Error: Please check your input fields and data types.";
    }
    // network or pull errors
    else if (error instanceof Prisma.PrismaClientInitializationError) {
        statusCode = 500;
        message = "Database connection failed!";
    }

    return { statusCode, message };
};