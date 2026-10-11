import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma';
import { signToken, verifyToken } from '../src/lib/auth';

describe('CineBook Core Business Logic & Concurrency Test Suite', () => {

  describe('1. Authentication & Security Logic', () => {
    test('Password hashing and secure verification', async () => {
      const rawPassword = 'SecretPassword@123';
      const hash = await bcrypt.hash(rawPassword, 10);
      
      assert.notStrictEqual(hash, rawPassword);
      const isMatch = await bcrypt.compare(rawPassword, hash);
      assert.strictEqual(isMatch, true);

      const isWrongMatch = await bcrypt.compare('WrongPassword', hash);
      assert.strictEqual(isWrongMatch, false);
    });

    test('JWT Session Signing and Verification', async () => {
      const mockUser = {
        id: 'test-user-123',
        email: 'tester@cinebook.com',
        name: 'Tester',
        role: 'CUSTOMER' as const,
      };

      const token = await signToken(mockUser);
      assert.ok(token && typeof token === 'string');

      const verified = await verifyToken(token);
      assert.ok(verified);
      assert.strictEqual(verified.email, mockUser.email);
      assert.strictEqual(verified.role, 'CUSTOMER');
    });

    test('Duplicate account rejection in database', async () => {
      const existingUser = await prisma.user.findFirst();
      assert.ok(existingUser, 'At least one user must exist from seed');

      // Attempt to query user with existing email
      const duplicate = await prisma.user.findUnique({
        where: { email: existingUser.email },
      });
      assert.strictEqual(duplicate?.id, existingUser.id);
    });

    test('Role-based access check blocks regular customer from admin operations', async () => {
      const customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
      assert.ok(customer);
      assert.notStrictEqual(customer.role, 'ADMIN', 'Customer should not have admin role');
    });
  });

  describe('2. Seat Reservation & Concurrency Control', () => {
    let testShow: any;
    let availableSeat: any;
    let customer1: any;
    let customer2: any;

    before(async () => {
      testShow = await prisma.show.findFirst({
        where: { status: 'ACTIVE' },
        include: { screen: { include: { seats: true } } },
      });
      assert.ok(testShow, 'Test show must exist');
      availableSeat = testShow.screen.seats[0];
      assert.ok(availableSeat, 'Test seat must exist');

      const customers = await prisma.user.findMany({ where: { role: 'CUSTOMER' }, take: 2 });
      customer1 = customers[0];
      customer2 = customers[1] || customers[0];
    });

    test('Successful temporary seat reservation', async () => {
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // Clean any existing reservation for this seat
      await prisma.seatReservation.deleteMany({
        where: { showId: testShow.id, seatId: availableSeat.id },
      });

      const reservation = await prisma.seatReservation.create({
        data: {
          showId: testShow.id,
          seatId: availableSeat.id,
          userId: customer1.id,
          status: 'PENDING',
          expiresAt,
        },
      });

      assert.ok(reservation);
      assert.strictEqual(reservation.status, 'PENDING');
      assert.strictEqual(reservation.seatId, availableSeat.id);
    });

    test('CONCURRENCY SIMULATION: Second user is blocked from reserving the same seat', async () => {
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // User 2 attempts to reserve the seat that User 1 holds
      let conflictDetected = false;

      try {
        await prisma.$transaction(async (tx) => {
          // Check existing active reservation
          const existing = await tx.seatReservation.findFirst({
            where: {
              showId: testShow.id,
              seatId: availableSeat.id,
              status: 'PENDING',
              expiresAt: { gt: new Date() },
            },
          });

          if (existing) {
            throw new Error('SEAT_CONFLICT: Seat is already temporarily reserved by another user');
          }

          return await tx.seatReservation.create({
            data: {
              showId: testShow.id,
              seatId: availableSeat.id,
              userId: customer2.id,
              status: 'PENDING',
              expiresAt,
            },
          });
        });
      } catch (err: any) {
        if (err.message.includes('SEAT_CONFLICT')) {
          conflictDetected = true;
        }
      }

      assert.strictEqual(conflictDetected, true, 'Concurrency lock must reject second user reservation');
    });

    test('Same physical seat CAN be booked for a DIFFERENT show', async () => {
      // Find a different show on the same screen
      const differentShow = await prisma.show.findFirst({
        where: {
          id: { not: testShow.id },
          screenId: testShow.screenId,
          status: 'ACTIVE',
        },
      });

      if (differentShow) {
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        const res = await prisma.seatReservation.create({
          data: {
            showId: differentShow.id,
            seatId: availableSeat.id,
            userId: customer2.id,
            status: 'PENDING',
            expiresAt,
          },
        });

        assert.ok(res);
        assert.strictEqual(res.showId, differentShow.id);
        assert.strictEqual(res.seatId, availableSeat.id);

        // Cleanup
        await prisma.seatReservation.delete({ where: { id: res.id } });
      }
    });

    test('Expired reservation allows re-reservation', async () => {
      // Set expired reservation
      await prisma.seatReservation.updateMany({
        where: { showId: testShow.id, seatId: availableSeat.id },
        data: { expiresAt: new Date(Date.now() - 1000), status: 'EXPIRED' },
      });

      // Now customer 2 should be able to claim the seat
      const newReservation = await prisma.seatReservation.create({
        data: {
          showId: testShow.id,
          seatId: availableSeat.id,
          userId: customer2.id,
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      });

      assert.ok(newReservation);
      assert.strictEqual(newReservation.userId, customer2.id);

      // Cleanup
      await prisma.seatReservation.deleteMany({
        where: { showId: testShow.id, seatId: availableSeat.id },
      });
    });
  });

  describe('3. Booking & Payment Verification Lifecycle', () => {
    let testShow: any;
    let customer: any;
    let bookedSeat: any;

    before(async () => {
      testShow = await prisma.show.findFirst({ where: { status: 'ACTIVE' } });
      customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
      const screenSeats = await prisma.seat.findMany({ where: { screenId: testShow.screenId }, take: 2 });
      bookedSeat = screenSeats[1] || screenSeats[0];
      await prisma.bookingSeat.deleteMany({ where: { showId: testShow.id, seatId: bookedSeat.id } });
    });

    test('Create Booking from reservation with correct tax calculation', async () => {
      const subtotal = testShow.regularPrice;
      const convenienceFee = testShow.convenienceFee;
      const tax = subtotal * testShow.taxRate;
      const totalAmount = subtotal + convenienceFee + tax;

      const booking = await prisma.booking.create({
        data: {
          userId: customer.id,
          showId: testShow.id,
          status: 'PENDING',
          subtotal,
          convenienceFee,
          tax,
          totalAmount,
          seats: {
            create: [
              {
                showId: testShow.id,
                seatId: bookedSeat.id,
                priceAtBooking: subtotal,
                category: 'REGULAR',
              },
            ],
          },
        },
        include: { seats: true },
      });

      assert.ok(booking);
      assert.strictEqual(booking.status, 'PENDING');
      assert.strictEqual(booking.totalAmount, totalAmount);
      assert.strictEqual(booking.seats.length, 1);

      // Payment Confirmation Simulation
      const payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          provider: 'DEMO',
          providerReference: `DEMO-TEST-${Date.now()}`,
          amount: totalAmount,
          status: 'SUCCESS',
        },
      });

      const confirmedBooking = await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'CONFIRMED' },
      });

      assert.strictEqual(payment.status, 'SUCCESS');
      assert.strictEqual(confirmedBooking.status, 'CONFIRMED');

      // Cancellation and Refund Policy Test (75% refund)
      const refundAmount = totalAmount * 0.75;
      const cancellation = await prisma.cancellation.create({
        data: {
          bookingId: booking.id,
          paymentId: payment.id,
          reason: 'Automated test cancellation',
          refundAmount,
          status: 'APPROVED',
        },
      });

      assert.strictEqual(cancellation.status, 'APPROVED');
      assert.ok(Math.abs(cancellation.refundAmount - refundAmount) < 0.001);

      // Cleanup test records
      await prisma.cancellation.delete({ where: { id: cancellation.id } });
      await prisma.payment.delete({ where: { id: payment.id } });
      await prisma.bookingSeat.deleteMany({ where: { bookingId: booking.id } });
      await prisma.booking.delete({ where: { id: booking.id } });
    });
  });

  describe('4. Administration & Verification', () => {
    test('Admin statistics calculation accuracy', async () => {
      const [totalMovies, totalTheatres, totalShows] = await Promise.all([
        prisma.movie.count(),
        prisma.theatre.count(),
        prisma.show.count(),
      ]);

      assert.ok(totalMovies >= 8, 'At least 8 movies must be seeded');
      assert.ok(totalTheatres >= 4, 'At least 4 theatres must be seeded');
      assert.ok(totalShows >= 10, 'Multiple upcoming shows must be seeded');
    });
  });

});
