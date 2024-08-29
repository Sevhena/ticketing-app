import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus
} from '@svraven/tks-common';
import { OrderCancelledListener, OrderCreatedListener } from '../listeners';
import { natsWrapper } from '../nats-wrapper';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = await Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: 'kfbvnjlvnsf',
    orderStatus: OrderStatus.Created,
    price: 10
  }).save();

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    expiresAt: 'jfsnlsf',
    userId: order.userId,
    orderStatus: OrderStatus.Cancelled,
    ticket: {
      id: 'jflvndkm',
      price: order.price
    }
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, order, data, msg };
};

it('updates the status of the order', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.orderStatus).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
