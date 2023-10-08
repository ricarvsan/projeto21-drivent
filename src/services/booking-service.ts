import { forbiddenError, notFoundError } from "@/errors";
import { bookingRepository, enrollmentRepository, ticketsRepository } from "@/repositories";

async function getBookingById(userId: number) {
    const result = await bookingRepository.findBookingByUserId(userId)
    if(!result) throw notFoundError();

    const {id, Room} = result;
    const booking = {id, Room};

    return booking;
}

async function postBooking(userId: number, roomId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    
    const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
    if(ticket.TicketType.isRemote) throw forbiddenError('Booking is not allowed for Remote TicketTypes');
    if(!ticket.TicketType.includesHotel) throw forbiddenError('Booking is not allowed for TicketTypes that not includes Hotel');
    if(ticket.status === 'RESERVED') throw forbiddenError('Booking will be allowed when ticket status be "PAID"');

    const room = await bookingRepository.getRoom(roomId);
    if(!room) throw notFoundError();
    if(room.Booking.length === room.capacity) throw forbiddenError('Room capacity is full')

    const booking = await bookingRepository.createBooking({userId, roomId});

    return booking;
}


export const bookingService = {
    getBookingById,
    postBooking
};