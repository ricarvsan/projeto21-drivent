import { prisma } from '@/config';
import { Booking } from '@prisma/client';

async function findBookingByUserId(userId: number) {
    return prisma.booking.findUnique({
        where: { userId },
        include: {
            Room: true
        }
    })
}

async function getRoomCapacity(roomId: number) {
    return prisma.booking.findMany({
        where: { roomId }
    })
}

async function getRoom(roomId: number) {
    return prisma.room.findUnique({
        where: { id: roomId },
        include: {
            Booking: true
        }
    })
}

async function createBooking(createBooking: CreateBooking) {
    return await prisma.booking.create({
        data: createBooking
    }
    )
}

async function findBookingByBookingId(bookingId: number) {
    return await prisma.booking.findUnique({
        where: { id: bookingId }
    })
}

async function updateBooking(roomId: number, bookingId: number) {
    return await prisma.booking.update({
        where: {
            id: bookingId
        },
        data: {
            roomId: roomId,
            updatedAt: new Date()
        }
    })
}

export type CreateBooking = Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>
export type RoomBooking = Omit<CreateBooking, 'userId'>

export const bookingRepository = {
    findBookingByUserId,
    getRoomCapacity,
    getRoom,
    createBooking,
    findBookingByBookingId,
    updateBooking
};