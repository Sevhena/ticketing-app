import request from 'supertest';
import { app } from '../../app';

it('fails when an incorrest password is supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);
  const response = await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(204);
  expect(response.get('Set-Cookie')![0].split(' ')[0]).toEqual('session=;');
});
