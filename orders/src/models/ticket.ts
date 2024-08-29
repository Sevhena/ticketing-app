import { Schema, Model, model, Document, Query } from 'mongoose';
import { Order, OrderStatus } from './order';

// An interface that describes the properties required to create a new ticket
interface TicketAttrs {
  id: string;
  title: string;
  price: number;
  version: number;
}

// An interface that describes the properties a Ticket Model has
interface TicketModel extends Model<TicketDoc, {}, TicketMethods> {
  build(attrs: TicketAttrs): TicketDoc;
  findCurrent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

// An interface that describes the properties a ticket Document has
export interface TicketDoc extends Document {
  title: string;
  price: number;
  version: number;
  active: boolean;
}

interface TicketMethods {
  isReserved(): Promise<Boolean>;
}

const ticketSchema = new Schema<TicketDoc, TicketModel, TicketMethods>(
  {
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    active: {
      type: Boolean,
      default: true
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
      versionKey: false,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      }
    }
  }
);

ticketSchema.set('versionKey', 'version');

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price
  });
};

ticketSchema.statics.findCurrent = (event: { id: string; version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1
  });
};

// 1) Run query to look at all orders.
//  => Find an order where with said ticket and where orderStatus != cancelled
ticketSchema.methods.isReserved = async function (): Promise<Boolean> {
  const existingOrder = await Order.findOne({
    ticket: this,
    orderStatus: {
      $ne: OrderStatus.Cancelled
    }
  });

  return !!existingOrder;
};

ticketSchema.pre(/^find/, function (next) {
  (this as Query<any, any, {}, any, 'find', Record<string, never>>).find({
    active: { $ne: false }
  });
  next();
});

const Ticket = model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
