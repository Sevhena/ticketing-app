import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Order } from '../../models/order';
import { OrderStatus } from '@svraven/tks-common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

it('return a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'ajndhbksj',
      orderId: new mongoose.Types.ObjectId().toHexString()
    })
    .expect(404);
});

it('return a 401 when purchasing an order that does not belong to the user', async () => {
  const order = await Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    orderStatus: OrderStatus.Created,
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 55
  }).save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'ajndhbksj',
      orderId: order.id
    })
    .expect(401);
});

it('return a 400 when purchasing an order that is cancelled', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = await Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    orderStatus: OrderStatus.Cancelled,
    version: 0,
    userId: userId,
    price: 55
  }).save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'ajndhbksj',
      orderId: order.id
    })
    .expect(400);
});

it('returns a 204 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);

  const order = await Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    orderStatus: OrderStatus.Created,
    version: 0,
    userId: userId,
    price: price
  }).save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201);

  const stripeCharge = (await stripe.charges.list({ limit: 50 })).data[0];

  expect(stripeCharge.amount).toEqual(order.price * 100);

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge.id
  });

  expect(payment).not.toBeNull();
});
