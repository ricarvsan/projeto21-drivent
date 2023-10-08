import { RoomBooking } from '@/repositories';
import Joi from 'joi';

export const bookingSchema = Joi.object<RoomBooking>({
  roomId: Joi.number().required(),
});