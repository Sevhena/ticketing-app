import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  NotFoundError,
  requireAuth,
  Subjects,
  UnauthorizedError
} from '@svraven/tks-common';

import { Order, OrderStatus } from '../models/order';
import { eventsEmitter } from '../events/events-emitter';
import { createOrderEvent } from '../utils/create-order-event';

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

      const orderEvent = createOrderEvent(order, Subjects.OrderCancelled);

      await orderEvent.save();

      eventsEmitter.emitOrderEvent();

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
