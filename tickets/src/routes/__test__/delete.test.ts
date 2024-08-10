import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('return a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .delete(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).delete(`/api/tickets/${id}`).send().expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const response = await global.createTicket('khfjssks', 20);

  await request(app)
    .delete(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401);
});

it('deletes the ticket when provided valid inputs', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'bjfnlnvwfv',
      price: 20
    });

  await request(app)
    .delete(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send()
    .expect(204);

  await request(app).get(`/api/tickets/${response.body.id}`).send().expect(404);
});
