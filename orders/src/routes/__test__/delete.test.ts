import request from 'supertest';
import { app } from '../../app';
import { OrderStatus } from '@svraven/tks-common';

it('marks an order as cancelled', async () => {
  const ticket = await global.createTicket();

  const cookie = global.signin();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', cookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(204);

  const { body: updatedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(updatedOrder.orderStatus).toEqual(OrderStatus.Cancelled);
});
