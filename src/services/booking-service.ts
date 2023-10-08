import { enrollmentNotFoundError, forbiddenError, notFoundError } from "@/errors";
import { CreateBooking, bookingRepository, enrollmentRepository, ticketsRepository } from "@/repositories";

async function getBookingById(userId: number) {
    const result = await bookingRepository.findBookingByUserId(userId)
    if(!result) throw notFoundError();

    const {id, Room} = result;
    const booking = {id, Room};

    return booking;
}

async function postBooking(userId: number, roomId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if(!enrollment) throw enrollmentNotFoundError();
    
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

async function updateBooking(roomId: number, bookingId: number) {
    const booking = await bookingRepository.findBookingByBookingId(bookingId)
    if(!booking) throw forbiddenError('User doesnt have a booking')

    const room = await bookingRepository.getRoom(roomId);
    if(!room) throw notFoundError();
    if(room.Booking.length === room.capacity) throw forbiddenError('Room capacity is full')

    const updatedBooking = await bookingRepository.updateBooking(roomId, bookingId)
    return updatedBooking;
}


export const bookingService = {
    getBookingById,
    postBooking,
    updateBooking
};