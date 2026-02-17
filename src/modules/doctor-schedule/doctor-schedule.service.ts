import status from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { ICreateDoctorSchedulePayload } from "./doctor-schedule.interface";
import { IQueryParams } from "../../types/queryBuilder.types";
import { QueryBuilder } from "../../utils/queryBuilder";
import { IRequestUser } from "../auth/auth.interface";

// CREATE DOCTOR SCHEDULE (assign multiple schedules to a doctor)
const createDoctorSchedule = async (user:IRequestUser,payload:ICreateDoctorSchedulePayload) => {
 
const {scheduleIds} = payload
    const doctor = await prisma.doctor.findUnique({
        where: { email: user.email, isDeleted: false },
    });

    if (!doctor) {
        throw new AppError("Doctor not found", status.NOT_FOUND);
    }

  const existingSchedules = await prisma.schedule.findMany({
        where: {
            id: { in: scheduleIds }
        }
    });

    // Check if any ID from payload is missing in the database
    if (existingSchedules.length !== scheduleIds.length) {
        const existingIds = existingSchedules.map(s => s.id);
        const invalidIds = scheduleIds.filter(id => !existingIds.includes(id));
        
        throw new AppError(`Invalid schedule IDs: ${invalidIds.join(", ")}`, status.BAD_REQUEST);
    }

    const doctorScheduleData = scheduleIds.map((scheduleId) => ({
        doctorId:doctor.id,
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
            doctor:true
        },
        orderBy: { schedule: { startDate: "asc" } },
    });

    return doctorSchedules;
};

// GET ALL DOCTOR SCHEDULES (admin view)
const getAllDoctorSchedules = async (queryParams:IQueryParams) => {
   

    const doctorSchedulesQuery = new QueryBuilder(prisma.doctorSchedules,queryParams)
    .include({
        doctor:true,
        schedule:true
    })
    .paginate()
    .sort()

    return doctorSchedulesQuery.execute();
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
