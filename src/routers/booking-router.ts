import { authenticateToken, validateBody } from "@/middlewares";
import { Router } from "express";

const bookingRouter = Router();

bookingRouter
  .all('/*', authenticateToken)
  .get('/', )
  .post('/', validateBody(), )
  .put('/:bookingId', validateBody(), )

export { bookingRouter };