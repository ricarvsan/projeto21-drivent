import supertest from 'supertest';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import * as jwt from 'jsonwebtoken';
import { TicketStatus } from '@prisma/client';
import {
    createUser,
    createTicketType,
    createEnrollmentWithAddress,
    createTicket,
    createHotel,
    createRoomWithHotelId,
    createBooking,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import app, { init } from '@/app';


beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/booking');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it('should respond with status 404 if there is no booking', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        })

        it('should respond with status 200 and room data', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const booking = await createBooking(user.id, room.id);

            const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual({
                id: booking.id,
                Room: {
                    id: room.id,
                    name: room.name,
                    capacity: room.capacity,
                    hotelId: room.hotelId,
                    createdAt: room.createdAt.toISOString(),
                    updatedAt: room.updatedAt.toISOString()
                }
            });

        });
    });
});

describe('POST /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.post('/booking');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it('should respond with status 400 if body is not present', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.BAD_REQUEST);
        });

        describe('when body is valid', () => {
            it('should respond with status 400 if there is no enrollment', async () => {
                const body = { roomId: 1 };
                const user = await createUser();
                const token = await generateValidToken(user);

                const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

                expect(response.status).toBe(httpStatus.BAD_REQUEST);
            });

            describe('when there is enrollment', () => {
                it('should respond with status 403 if TicketType is Remote', async () => {
                    const body = { roomId: 1 };
                    const user = await createUser();
                    const token = await generateValidToken(user);
                    const enrollment = await createEnrollmentWithAddress(user);
                    const ticketType = await createTicketType(true);
                    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

                    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

                    expect(response.status).toBe(httpStatus.FORBIDDEN);
                    expect(response.body).toEqual({
                        message: 'Booking is not allowed for Remote TicketTypes'
                    });
                });

                it('should respond with status 403 if TicketType not inclues hotel', async () => {
                    const body = { roomId: 1 };
                    const user = await createUser();
                    const token = await generateValidToken(user);
                    const enrollment = await createEnrollmentWithAddress(user);
                    const ticketType = await createTicketType(false, false);
                    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

                    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

                    expect(response.status).toBe(httpStatus.FORBIDDEN);
                    expect(response.body).toEqual({
                        message: 'Booking is not allowed for TicketTypes that not includes Hotel'
                    });
                });

                it('should respond with status 403 if TicketStatus is not PAID', async () => {
                    const body = { roomId: 1 };
                    const user = await createUser();
                    const token = await generateValidToken(user);
                    const enrollment = await createEnrollmentWithAddress(user);
                    const ticketType = await createTicketType(false, true);
                    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

                    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

                    expect(response.status).toBe(httpStatus.FORBIDDEN);
                    expect(response.body).toEqual({
                        message: 'Booking will be allowed when ticket status be "PAID"'
                    });
                });

                it('should respond with status 404 if room is not found', async () => {
                    const body = { roomId: 1 };
                    const user = await createUser();
                    const token = await generateValidToken(user);
                    const enrollment = await createEnrollmentWithAddress(user);
                    const ticketType = await createTicketType(false, true);
                    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

                    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

                    expect(response.status).toBe(httpStatus.NOT_FOUND);
                    expect(response.body).toEqual({
                        message: 'No result for this search!'
                    });
                });

                it('should respond with status 403 if room capacity is full', async () => {
                    const user = await createUser();
                    const token = await generateValidToken(user);
                    const enrollment = await createEnrollmentWithAddress(user);
                    const ticketType = await createTicketType(false, true);
                    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
                    const hotel = await createHotel();
                    const room = await createRoomWithHotelId(hotel.id, 0);
                    const body = { roomId: room.id }

                    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

                    expect(response.status).toBe(httpStatus.FORBIDDEN);
                    expect(response.body).toEqual({
                        message: 'Room capacity is full'
                    });
                });

                it('should respond with status 200 and bookingId', async () => {
                    const user = await createUser();
                    const token = await generateValidToken(user);
                    const enrollment = await createEnrollmentWithAddress(user);
                    const ticketType = await createTicketType(false, true);
                    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
                    const hotel = await createHotel();
                    const room = await createRoomWithHotelId(hotel.id);
                    const body = { roomId: room.id }

                    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

                    expect(response.status).toBe(httpStatus.OK);
                    expect(response.body).toEqual({
                        bookingId: response.body.bookingId
                    });
                });

            });
        });
    });
});

describe('PUT /booking/:bookingId', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.put('/booking/1');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it('should respond with status 400 if body is not present', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.BAD_REQUEST);
        });

        it('should respond with status 400 if room is not valid', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const body = { roomId: 1 }

            const response = await server.put(`/booking/${faker.random.word()}`).set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.BAD_REQUEST);
        });

        it('should respond with status 403 if user has no booking', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const body = { roomId: room.id }

            const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send(body);

            expect(response.status).toBe(httpStatus.FORBIDDEN);
            expect(response.body).toEqual({
                message: 'User doesnt have a booking'
            })
        });

        it('should respond with status 404 if room is not found', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const body = { roomId: 1 }
            const booking = await createBooking(user.id, room.id)

            const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send(body);

            expect(response.status).toBe(httpStatus.NOT_FOUND);
            expect(response.body).toEqual({
                message: 'No result for this search!'
            })
        });

        it('should respond with status 404 if room is not found', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const body = { roomId: 1 }
            const booking = await createBooking(user.id, room.id)

            const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send(body);

            expect(response.status).toBe(httpStatus.NOT_FOUND);
            expect(response.body).toEqual({
                message: 'No result for this search!'
            })
        });

        it('should respond with status 403 if room capacity is full', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const room2 = await createRoomWithHotelId(hotel.id, 0)
            const body = { roomId: room2.id }
            const booking = await createBooking(user.id, room.id)

            const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send(body);

            expect(response.status).toBe(httpStatus.FORBIDDEN);
            expect(response.body).toEqual({
                message: 'Room capacity is full'
            })
        });

        it('should respond with status 200 and bookingId', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const room2 = await createRoomWithHotelId(hotel.id)
            const body = { roomId: room2.id }
            const booking = await createBooking(user.id, room.id)

            const response = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send(body);

            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual({
                bookingId: response.body.bookingId
            });
        });
    });
});
