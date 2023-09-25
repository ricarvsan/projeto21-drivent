import { notFoundError } from "@/errors";
import { Ticket, TicketType } from "@/protocols";
import { ticketsRepository } from "@/repositories/tickets-repository";

export async function getTicketTypes(): Promise<TicketType[]> {
    const tickets = await ticketsRepository.getTicketsTypes();
    if(!tickets) throw notFoundError();
    return tickets;
}



export const ticketsService = {
    getTicketTypes
}
