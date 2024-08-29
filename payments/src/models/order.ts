import { OrderStatus } from '@svraven/tks-common';
import { Model, Document, Schema, model } from 'mongoose';

export interface OrderAttrs {
  id: string;
  orderStatus: OrderStatus;
  expiresAt: Date;
  ticket: string;
  version: number;
  userId: string;
  price: number;
}

interface OrderModel extends Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
  findCurrent(event: { id: string; version: number }): Promise<OrderDoc | null>;
}

interface OrderDoc extends Document {
  orderStatus: OrderStatus;
  expiresAt: Date;
  version: number;
  userId: string;
  price: number;
  ticket: string;
}

const orderSchema = new Schema<OrderDoc, OrderModel>(
  {
    userId: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    ticket: {
      type: String,
      required: true
    },
    orderStatus: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus)
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    toObject: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      }
    },
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      }
    }
  }
);

orderSchema.set('versionKey', 'version');

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    orderStatus: attrs.orderStatus,
    expiresAt: attrs.expiresAt,
    version: attrs.version,
    userId: attrs.userId,
    price: attrs.price,
    ticket: attrs.ticket
  });
};

orderSchema.statics.findCurrent = (event: { id: string; version: number }) => {
  return Order.findOne({
    _id: event.id,
    version: event.version - 1
  });
};

const Order = model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
