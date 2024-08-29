import { Schema, model } from 'mongoose';
import {
  InternalEventDoc,
  InternalEventModel,
  Subjects,
  EventStatus,
  PaymentEvent as IPaymentEvent
} from '@svraven/tks-common';

type PaymentEventDoc = InternalEventDoc<IPaymentEvent>;
type PaymentEventModel = InternalEventModel<IPaymentEvent, PaymentEventDoc>;

const paymentEventSchema = new Schema<PaymentEventDoc, PaymentEventModel>(
  {
    subject: {
      type: String,
      enum: Object.values(Subjects),
      required: true
    },
    data: {},
    status: {
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.PENDING
    }
  },
  {
    toJSON: {
      versionKey: false,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      }
    }
  }
);

paymentEventSchema.static('build', (attrs: IPaymentEvent) => {
  return new PaymentEvent(attrs);
});

const PaymentEvent = model<PaymentEventDoc, PaymentEventModel>(
  'PaymentEvent',
  paymentEventSchema
);

export { PaymentEventDoc };
export { PaymentEvent };
