import { Schema, Model, model, Document } from 'mongoose';
import { Order, OrderStatus } from './order';

// An interface that describes the properties required to create a new ticket
interface TicketAttrs {
  title: string;
  price: number;
}

// An interface that describes the properties a Ticket Model has
interface TicketModel extends Model<TicketDoc, {}, TicketMethods> {
  build(attrs: TicketAttrs): TicketDoc;
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
    },
    version: {
      type: Number,
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

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
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

ticketSchema.pre('save', function (next) {
  this.version = this.version + 1;
  next();
});

const Ticket = model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
