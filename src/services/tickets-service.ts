import { invalidDataError, notFoundError } from "@/errors";
import { Ticket, TicketType } from "@/protocols";
import { enrollmentRepository } from "@/repositories";
import { ticketsRepository } from "@/repositories/tickets-repository";

export async function getTicketTypes(): Promise<TicketType[]> {
    const tickets = await ticketsRepository.getTicketsTypes();
    if(!tickets) throw notFoundError();

    return tickets;
}

export async function getTicket(userId: number): Promise<Ticket> {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if(!enrollment) throw notFoundError();

    const ticket = await ticketsRepository.getTicket(enrollment.id);
    if(!ticket) throw notFoundError();

    return ticket;
}

export async function createTicket(ticketTypeId: number, userId: number): Promise<Ticket> {
    if(!ticketTypeId) throw invalidDataError('ticketTypeId must be valid!');

    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if(!enrollment) throw notFoundError();

    return await ticketsRepository.createTicket({ticketTypeId, enrollmentId: enrollment.id, status: 'RESERVED'})
}

export type CreateTicket = Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'TicketType'>

export const ticketsService = {
    getTicketTypes,
    getTicket,
    createTicket
}
