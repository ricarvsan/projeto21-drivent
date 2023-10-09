import { bookingService, enrollmentsService } from "@/services";
import { bookingRepository, enrollmentRepository } from "@/repositories";
import { faker } from "@faker-js/faker";
import { Booking, Room } from "@prisma/client";

beforeEach(() => {
    jest.clearAllMocks();
});


describe('unit tests: GET /booking', () => {
    describe('GET /booking', () => {
        it('should respond with status 404 if there is no booking', async () => {
            jest.spyOn(bookingRepository, 'findBookingByUserId').mockResolvedValueOnce(undefined);

            const booking = bookingService.getBookingById(12345);

            expect(booking).rejects.toEqual({
                name: 'NotFoundError',
                message: 'No result for this search!',
            });
        });

        it('should return id and room', async () => {
            const mock: Booking & {
                Room: Room;
            } = {
                id: 1,
                userId: 1,
                roomId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                Room: {
                    id: 1,
                    capacity: 3,
                    hotelId: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    name: faker.name.firstName(),
                },
            };

            jest.spyOn(bookingRepository, 'findBookingByUserId').mockResolvedValueOnce(mock);

            const booking = await bookingService.getBookingById(mock.userId);

            expect(booking).toEqual({
                id: mock.id,
                Room: {
                    id: mock.Room.id,
                    capacity: mock.Room.capacity,
                    hotelId: mock.Room.hotelId,
                    name: mock.Room.name,
                    createdAt: mock.Room.createdAt,
                    updatedAt: mock.Room.updatedAt,
                },
            });
        });
    });
});

describe('unit tests: POST /booking', () => {
    it('should return status 400 if there is no enrollment', async () => {
        jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(undefined);

        const enrollment = enrollmentsService.getOneWithAddressByUserId(12345);

        expect(enrollment).rejects.toEqual({
            name: 'EnrollmentNotFoundError',
            message: 'User is not enrolled in the event.',
        });
    });

    it('should return status 403 if TicketType is Remote', async () => {

    });
})

describe('unit tests: PUT /booking/:bookingId', () => {

})


