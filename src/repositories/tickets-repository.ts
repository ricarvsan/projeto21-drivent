import { prisma } from "@/config";
import { Ticket, TicketType } from "@/protocols";
import { CreateTicket } from "@/services/tickets-service";


export async function getTicketsTypes(): Promise<TicketType[]> {
    return await prisma.ticketType.findMany()
}

export async function getTicket(enrollmentId: number): Promise<Ticket> {
    return await prisma.ticket.findUnique({
        where: { 
            enrollmentId
        },
        include: {
            TicketType: true
        }
    })
}

export async function createTicket(data: CreateTicket): Promise<Ticket> {
    return await prisma.ticket.create({
        data,
        include: {
            TicketType: true
        }
    })
}

export const ticketsRepository = {
    getTicketsTypes,
    getTicket,
    createTicket
}