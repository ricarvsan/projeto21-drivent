import { AuthenticatedRequest } from "@/middlewares";
import { TicketType } from "@/protocols";
import { ticketsService } from "@/services/tickets-service";
import { Response } from "express";
import httpStatus from "http-status";


export async function getTicketTypes(req: AuthenticatedRequest, res: Response): Promise<void> {
  const tickets = await ticketsService.getTicketTypes();
  res.status(httpStatus.OK).send(tickets)
}

export async function getTicket(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { userId } = req;
  const ticket = await ticketsService.getTicket(userId);
  res.status(httpStatus.OK).send(ticket)
}

export async function createTicket(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { ticketTypeId } = req.body;
  const { userId } = req;

  const ticket = await ticketsService.createTicket(ticketTypeId, userId);
  res.status(httpStatus.CREATED).send(ticket)
}

