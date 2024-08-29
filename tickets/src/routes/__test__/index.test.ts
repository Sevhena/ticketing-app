import request from 'supertest';
import { app } from '../../app';

it('can fetch a list of tickets', async () => {
  await global.createTicket(global.signin(), 'hkdacjsd', 20);
  await global.createTicket(global.signin(), 'fbahbkgvf', 20);
  await global.createTicket(global.signin(), 'ylbrbvhsk', 20);

  const response = await request(app).get('/api/tickets').send().expect(200);

  expect(response.body.length).toEqual(3);
});
