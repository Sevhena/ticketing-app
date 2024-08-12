import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  BadRequestError,
  EventStatus,
  NotFoundError,
  requireAuth,
  Subjects,
  validateRequest
} from '@svraven/tks-common';

import { Ticket } from '../models/ticket';
import { Order, OrderStatus } from '../models/order';
import mongoose from 'mongoose';
import { OrderEvent } from '../models/order-event';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.route('/api/orders').post(
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId must be provided')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // Find ticket the user is trying to order
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new NotFoundError();
    }

    // Make sure ticket is not already reserved
    if (await ticket.isReserved()) {
      throw new BadRequestError('Ticket is already reserved');
    }

    // Calculate an expiration date for the order (15 min)
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order | save it to the database + publish event
    const order = Order.build({
      userId: req.currentUser!.id,
      orderStatus: OrderStatus.Created,
      expiresAt: expiration,
      ticket
    });

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      await order.save();

      const orderEvent = OrderEvent.build({
        subject: Subjects.OrderCreated,
        status: EventStatus.PENDING,
        data: {
          id: order.id,
          userId: order.userId,
          orderStatus: order.orderStatus,
          expiresAt: order.expiresAt.toISOString(),
          version: order.version,
          ticket
        }
      });

      await orderEvent.save();

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }

    res.status(201).json(order);
  }
);

export { router as createOrderRouter };
