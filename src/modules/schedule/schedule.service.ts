import status from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { ICreateSchedulePayload, IScheduleFilterRequest } from "./schedule.interface";

// CREATE SCHEDULE
const createSchedule = async (payload: ICreateSchedulePayload) => {
    const { startDate, endDate, startTime, endTime } = payload;

    const schedule = await prisma.schedule.create({
        data: {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            startTime,
            endTime,
        },
    });

    return schedule;
};

// GET ALL SCHEDULES
const getAllSchedules = async (filters: IScheduleFilterRequest) => {
    const where: Record<string, unknown> = {};

    if (filters.startDate && filters.endDate) {
        where.startDate = {
            gte: new Date(filters.startDate),
        };
        where.endDate = {
            lte: new Date(filters.endDate),
        };
    }

    const schedules = await prisma.schedule.findMany({
        where,
        orderBy: { createdAt: "desc" },
    });

    return schedules;
};

// GET SCHEDULE BY ID
const getScheduleById = async (id: string) => {
    const schedule = await prisma.schedule.findUnique({
        where: { id },
        include: {
            doctorsSchedule: {
                include: {
                    doctor: true,
                },
            },
            appointment: true,
        },
    });

    if (!schedule) {
        throw new AppError("Schedule not found", status.NOT_FOUND);
    }

    return schedule;
};

// DELETE SCHEDULE
const deleteSchedule = async (id: string) => {
    const schedule = await prisma.schedule.findUnique({
        where: { id },
    });

    if (!schedule) {
        throw new AppError("Schedule not found", status.NOT_FOUND);
    }

    await prisma.schedule.delete({
        where: { id },
    });

    return schedule;
};

export const scheduleServices = {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    deleteSchedule,
};
