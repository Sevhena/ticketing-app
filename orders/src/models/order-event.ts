import { Schema, model } from 'mongoose';
import {
  InternalEventDoc,
  InternalEventModel,
  Subjects,
  EventStatus,
  OrderEvent as IOrderEvent
} from '@svraven/tks-common';

type OrderEventDoc = InternalEventDoc<IOrderEvent>;
type OrderEventModel = InternalEventModel<IOrderEvent, OrderEventDoc>;

const orderEventSchema = new Schema<OrderEventDoc, OrderEventModel>(
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
    toObject: {
      versionKey: false,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      }
    },
    toJSON: {
      versionKey: false,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      }
    },
    timestamps: true
  }
);

orderEventSchema.static('build', (attrs: IOrderEvent) => {
  return new OrderEvent(attrs);
});

const OrderEvent = model<OrderEventDoc, OrderEventModel>(
  'OrderEvent',
  orderEventSchema
);

export { OrderEventDoc };
export { OrderEvent };
