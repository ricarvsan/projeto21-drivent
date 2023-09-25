import { getTicketTypes } from '@/controllers/tickets-controller';
import { authenticateToken, validateBody } from '@/middlewares';
import { Router } from 'express';

const ticketsRouter = Router();

ticketsRouter
  .all('/*', authenticateToken)
  .get('/', )
  .get('/types', getTicketTypes)
  .post('/', );

export { ticketsRouter };
