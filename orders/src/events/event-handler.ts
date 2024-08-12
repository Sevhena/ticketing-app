import {
  AbstractEventHandler,
  Subjects,
  OrderEvent
} from '@svraven/tks-common';

import { OrderCreatedPublisher, OrderCancelledPublisher } from './publishers';
import { natsWrapper } from './nats-wrapper';
import { OrderEventDoc } from '../models/order-event';

export class OrderEventHandler extends AbstractEventHandler<
  OrderEvent,
  OrderEventDoc
> {
  selectPublisher(subject: Subjects) {
    switch (subject) {
      case Subjects.OrderCreated:
        return new OrderCreatedPublisher(natsWrapper.client);
      case Subjects.OrderCancelled:
        return new OrderCancelledPublisher(natsWrapper.client);
      default:
        throw new Error('Publisher not defined');
    }
  }
}
