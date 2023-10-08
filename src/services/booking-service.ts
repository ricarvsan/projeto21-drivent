import { notFoundError } from "@/errors";
import { bookingRepository } from "@/repositories/booking-repository";

async function getBookingById(userId:number) {
    const result = await bookingRepository.findBookingByUserId(userId)
    if(!result) throw notFoundError();

    const {id, Room} = result;
    const booking = {id, Room};

    return booking;
}

export const bookingService = {
    getBookingById,
};