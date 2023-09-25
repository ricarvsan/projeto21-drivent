import { prisma } from "@/config";
import { TicketType } from "@/protocols";


export async function getTicketsTypes(): Promise<TicketType[]> {
    return await prisma.ticketType.findMany()
}

export const ticketsRepository = {
    getTicketsTypes
}