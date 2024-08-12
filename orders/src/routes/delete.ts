import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  EventStatus,
  NotFoundError,
  requireAuth,
  Subjects,
  UnauthorizedError
} from '@svraven/tks-common';

import { Order, OrderStatus } from '../models/order';
import { OrderEvent } from '../models/order-event';

const router = express.Router();

router
  .route('/api/orders/:orderId')
  .delete(requireAuth, async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new UnauthorizedError();
    }

    order.orderStatus = OrderStatus.Cancelled;

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      await order.save();

      const orderEvent = OrderEvent.build({
        subject: Subjects.OrderCancelled,
        status: EventStatus.PENDING,
        data: {
          id: order.id,
          userId: order.userId,
          orderStatus: order.orderStatus,
          expiresAt: order.expiresAt.toISOString(),
          version: order.version,
          ticket: order.ticket
        }
      });

      await orderEvent.save();

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }

    res.status(204).json(order);
  });

export { router as deleteOrderRouter };
