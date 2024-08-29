import { EventStatus, Subjects } from '@svraven/tks-common';
import { PaymentEvent } from '../models/payment-event';
import { PaymentDoc } from '../models/payment';
import { eventsEmitter } from '../events/events-emitter';

export const createPaymentEvent = async (
  subject: Subjects,
  payment: PaymentDoc
) => {
  await PaymentEvent.build({
    subject,
    status: EventStatus.PENDING,
    data: {
      id: payment.id,
      orderId: payment.orderId,
      stripeSessionId: payment.stripeSessionId,
      status: payment.status,
      version: payment.version
    }
  }).save();

  eventsEmitter.emitPaymentEvent();
};
