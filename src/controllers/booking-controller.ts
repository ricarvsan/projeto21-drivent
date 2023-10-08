import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { bookingService } from '@/services';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
  
    const booking = await bookingService.getBookingById(userId);
  
    return res.status(httpStatus.OK).send(booking);
}