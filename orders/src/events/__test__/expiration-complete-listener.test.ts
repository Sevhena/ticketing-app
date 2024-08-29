import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../models/order';
import { ExpirationCompleteListener } from '../listeners';
import { natsWrapper } from '../nats-wrapper';
import { Ticket } from '../../models/ticket';
import { ExpirationCompleteEvent, Subjects } from '@svraven/tks-common';
import { OrderEvent } from '../../models/order-event';
import { eventsEmitter } from '../events-emitter';

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = await Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
    version: 0
  }).save();

  const order = await Order.build({
    orderStatus: OrderStatus.Created,
    userId: 'ljfkdsd',
    expiresAt: new Date(),
    ticket
  }).save();

  const data: ExpirationCompleteEvent['data'] = {
    id: 'jbnslmkf',
    orderId: order.id,
    version: 1
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, order, data, msg };
};

it('updates the order status to cancelled', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.orderStatus).toEqual(OrderStatus.Cancelled);
});

it('creates a order cancelled event', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const orderEvent = await OrderEvent.findOne({
    subject: Subjects.OrderCancelled,
    'data.id': order.id,
    'data.version': order.version
  });

  expect(orderEvent).toBeDefined();
});

it('emits a new order event', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(eventsEmitter.emitOrderEvent).toHaveBeenCalled();
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
