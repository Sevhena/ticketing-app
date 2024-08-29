import {
  AwaitingPaymentEvent,
  PaymentCreatedEvent,
  Publisher,
  Subjects
} from '@svraven/tks-common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: PaymentCreatedEvent['subject'] = Subjects.PaymentCreated;
}

export class AwaitingPaymentPublisher extends Publisher<AwaitingPaymentEvent> {
  subject: AwaitingPaymentEvent['subject'] = Subjects.AwaitingPayment;
}
