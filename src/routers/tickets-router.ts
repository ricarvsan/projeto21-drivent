import { createTicket, getTicket, getTicketTypes } from '@/controllers/tickets-controller';
import { authenticateToken } from '@/middlewares';
import { Router } from 'express';

const ticketsRouter = Router();

ticketsRouter
  .all('/*', authenticateToken)
  .get('/', getTicket)
  .get('/types', getTicketTypes)
  .post('/', createTicket);

export { ticketsRouter };
