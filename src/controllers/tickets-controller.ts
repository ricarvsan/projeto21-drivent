import { AuthenticatedRequest } from "@/middlewares";
import { ticketsService } from "@/services/tickets-service";
import { Response } from "express";
import httpStatus from "http-status";


export async function getTicketTypes(req: AuthenticatedRequest, res: Response): Promise<void> {
  const tickets = await ticketsService.getTicketTypes();
  res.send(httpStatus.OK).send(tickets)
}

export async function getTicket(req: AuthenticatedRequest, res: Response): Promise<void> {

}
  
export async function createTicket(req: AuthenticatedRequest, res: Response): Promise<void> {

}
  
  