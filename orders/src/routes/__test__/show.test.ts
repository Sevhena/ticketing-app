import request from 'supertest';
import { app } from '../../app';

it('returns 401 if user tries to fetch an order they have not made', async () => {
  const ticket = await global.createTicket();

  const { body: order } = await request(app)
    .post(`/api/orders`)
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401);
});

it('fetched the order', async () => {
  const ticket = await global.createTicket();

  const user = global.signin();

  const { body: order } = await request(app)
    .post(`/api/orders`)
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});
