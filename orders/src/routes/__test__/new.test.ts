import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { OrderStatus } from '@svraven/tks-common';
import { Order } from '../../models/order';

it('return an error if the ticket does not exist', async () => {
  const ticketId = new mongoose.Types.ObjectId();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId })
    .expect(404);
});

it('return an error if the ticket is already reserved', async () => {
  const ticket = await global.createTicket();

  const order = Order.build({
    userId: 'bujkvnswflvk',
    orderStatus: OrderStatus.Created,
    ticket,
    expiresAt: new Date()
  });

  await order.save();

  await request(app)
    .post(`/api/orders`)
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('reserves a ticket', async () => {
  const ticket = await global.createTicket();

  await request(app)
    .post(`/api/orders`)
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);
});
