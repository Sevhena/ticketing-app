import {
  AbstractEventHandler,
  PaymentEvent,
  Subjects
} from '@svraven/tks-common';
import { natsWrapper } from './nats-wrapper';
import { PaymentEventDoc } from '../models/payment-event';
import {
  AwaitingPaymentPublisher,
  PaymentCreatedPublisher
} from './publishers';

export class PaymentEventHandler extends AbstractEventHandler<
  PaymentEvent,
  PaymentEventDoc
> {
  selectPublisher(subject: Subjects) {
    switch (subject) {
      case Subjects.AwaitingPayment:
        return new AwaitingPaymentPublisher(natsWrapper.client);
      case Subjects.PaymentCreated:
        return new PaymentCreatedPublisher(natsWrapper.client);
      default:
        throw new Error('Publisher not defined');
    }
  }
}
