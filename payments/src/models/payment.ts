import { PaymentStatus } from '@svraven/tks-common';
import { Document, Model, Schema, model } from 'mongoose';

// An interface that describes the properties required to create a new payment
interface PaymentAttrs {
  orderId: string;
  stripeSessionId: string;
  status: PaymentStatus;
}

// An interface that describes the properties a Payment Model has
interface PaymentModel extends Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

// An interface that describes the properties a payment Document has
export interface PaymentDoc extends Document {
  orderId: string;
  stripeSessionId: string;
  status: PaymentStatus;
  version: number;
}

const paymentSchema = new Schema<PaymentDoc, PaymentModel>(
  {
    orderId: {
      type: String,
      required: true
    },
    stripeSessionId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(PaymentStatus)
    }
  },
  {
    optimisticConcurrency: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      }
    }
  }
);

paymentSchema.set('versionKey', 'version');

paymentSchema.statics.build = (attrs: PaymentAttrs): PaymentDoc => {
  return new Payment(attrs);
};

const Payment = model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

export { Payment };
