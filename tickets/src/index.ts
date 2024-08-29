import 'express-async-errors';
import mongoose from 'mongoose';
import cron from 'node-cron';

import { natsWrapper } from './events/nats-wrapper';
import { app } from './app';
import { TicketEventHandler } from './events/event-handler';
import { TicketEvent } from './models/ticket-event';
import { eventsEmitter } from './events/events-emitter';
import {
  OrderCancelledListener,
  OrderCreatedListener
} from './events/listeners';

(async () => {
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
  if (!process.env.QUEUE_GROUP_NAME) {
    throw new Error('QUEUE_GROUP_NAME must be defined');
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

    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    const ticketEventHandler = new TicketEventHandler(TicketEvent);

    // Crons for Events
    const cronjob = cron.schedule('*/30 * * * * *', async () => {
      await ticketEventHandler.handle();
    });
    // Attach Listener for InternalEvents
    eventsEmitter.on(process.env.NATS_EVENT, async () => {
      try {
        cronjob.stop();
        await ticketEventHandler.handle();
      } catch (err) {
        console.log(err);
      } finally {
        cronjob.start();
      }
    });

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000...');
  });
})();
