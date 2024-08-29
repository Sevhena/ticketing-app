import {
  NotFoundError,
  OrderStatus,
  PaymentStatus,
  Subjects
} from '@svraven/tks-common';
import mongoose from 'mongoose';

import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { createPaymentEvent } from './create-payment-event';

const fulfillOrder = async (stripeSessionId: string, orderId: string) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError();
  }

  const payment = await Payment.findOne({
    stripeSessionId,
    status: PaymentStatus.Pending
  });

  if (!payment) {
    throw new NotFoundError();
  }

  order.set({ orderStatus: OrderStatus.Complete });
  payment.set({ status: PaymentStatus.Complete });

  const mongooseSession = await mongoose.startSession();
  try {
    mongooseSession.startTransaction();
    await order.save();
    await payment.save();

    await createPaymentEvent(Subjects.PaymentCreated, payment);

    await mongooseSession.commitTransaction();
  } catch (err) {
    await mongooseSession.abortTransaction();
    throw err;
  } finally {
    mongooseSession.endSession();
  }
};

export default fulfillOrder;
