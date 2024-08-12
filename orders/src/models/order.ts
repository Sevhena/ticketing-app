import { OrderStatus } from '@svraven/tks-common';
import { Document, Model, Schema, model } from 'mongoose';

import { TicketDoc } from './ticket';

// An interface that describes the properties required to create a new order
interface OrderAttrs {
  userId: string;
  orderStatus: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

// An interface that describes the properties a Order Model has
interface OrderModel extends Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

// An interface that describes the properties a order Document has
interface OrderDoc extends Document {
  id: string;
  title: any;
  price: any;
  userId: string;
  orderStatus: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
  version: number;
}

const orderSchema = new Schema<OrderDoc, OrderModel>(
  {
    userId: {
      type: String,
      required: true
    },
    orderStatus: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created
    },
    expiresAt: {
      type: Date,
      required: true
    },
    ticket: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true
    },
    version: {
      type: Number,
      required: true,
      default: 0
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

orderSchema.statics.build = (attrs: OrderAttrs): OrderDoc => {
  return new Order(attrs);
};

orderSchema.pre('save', function (next) {
  this.version = this.version + 1;
  next();
});

const Order = model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
export { OrderStatus };
