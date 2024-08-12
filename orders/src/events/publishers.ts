import {
  Publisher,
  Subjects,
  OrderCreatedEvent,
  OrderCancelledEvent
} from '@svraven/tks-common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: OrderCreatedEvent['subject'] = Subjects.OrderCreated;
}

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: OrderCancelledEvent['subject'] = Subjects.OrderCancelled;
}
