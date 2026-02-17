import status from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { ICreateDoctorSchedulePayload } from "./doctor-schedule.interface";

// CREATE DOCTOR SCHEDULE (assign multiple schedules to a doctor)
const createDoctorSchedule = async (payload: ICreateDoctorSchedulePayload) => {
    const { doctorId, scheduleIds } = payload;

    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId, isDeleted: false },
    });

    if (!doctor) {
        throw new AppError("Doctor not found", status.NOT_FOUND);
    }

    const doctorScheduleData = scheduleIds.map((scheduleId) => ({
        doctorId,
        scheduleId,
        isBooked: false,
    }));

    const result = await prisma.doctorSchedules.createMany({
        data: doctorScheduleData,
        skipDuplicates: true,
    });

    return result;
};

// GET ALL SCHEDULES FOR A DOCTOR
const getDoctorSchedules = async (doctorId: string) => {
    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId, isDeleted: false },
    });

    if (!doctor) {
        throw new AppError("Doctor not found", status.NOT_FOUND);
    }

    const doctorSchedules = await prisma.doctorSchedules.findMany({
        where: { doctorId },
        include: {
            schedule: true,
        },
        orderBy: { schedule: { startDate: "asc" } },
    });

    return doctorSchedules;
};

// GET ALL DOCTOR SCHEDULES (admin view)
const getAllDoctorSchedules = async () => {
    const doctorSchedules = await prisma.doctorSchedules.findMany({
        include: {
            doctor: true,
            schedule: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return doctorSchedules;
};

// DELETE DOCTOR SCHEDULE
const deleteDoctorSchedule = async (doctorId: string, scheduleId: string) => {
    const doctorSchedule = await prisma.doctorSchedules.findUnique({
        where: {
            doctorId_scheduleId: {
                doctorId,
                scheduleId,
            },
        },
    });

    if (!doctorSchedule) {
        throw new AppError("Doctor schedule not found", status.NOT_FOUND);
    }

    if (doctorSchedule.isBooked) {
        throw new AppError("Cannot delete a booked schedule", status.BAD_REQUEST);
    }

    await prisma.doctorSchedules.delete({
        where: {
            doctorId_scheduleId: {
                doctorId,
                scheduleId,
            },
        },
    });

    return doctorSchedule;
};

export const doctorScheduleServices = {
    createDoctorSchedule,
    getDoctorSchedules,
    getAllDoctorSchedules,
    deleteDoctorSchedule,
};
