import 'express-async-errors';
import mongoose from 'mongoose';
import cron from 'node-cron';

import { natsWrapper } from './events/nats-wrapper';
import { app } from './app';
import { OrderEventHandler } from './events/event-handler';
import { OrderEvent } from './models/order-event';
import orderEventEmitter from './events/events-emitter';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }
  if (!process.env.NATS_EVENT) {
    throw new Error('NATS_EVENT must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    const orderEventHandler = new OrderEventHandler(OrderEvent);

    // Crons for Events
    const cronjob = cron.schedule('*/2 * * * *', async () => {
      await orderEventHandler.handle();
    });
    // Attach Listener for InternalEvents
    orderEventEmitter.on(process.env.NATS_EVENT, async () => {
      try {
        cronjob.stop();
        await orderEventHandler.handle();
      } catch (err) {
        console.log(err);
      } finally {
        cronjob.start();
      }
    });

    await mongoose.connect(process.env.MONGO_URI);
    mongoose.set('transactionAsyncLocalStorage', true);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000...');
  });
};

start();
