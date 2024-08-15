import { Schema, Model, model, Document } from 'mongoose';
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
  id: string;
  title: string;
  price: number;
  version: number;
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
    status: {
      $ne: OrderStatus.Cancelled
    }
  });

  return !!existingOrder;
};

const Ticket = model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
