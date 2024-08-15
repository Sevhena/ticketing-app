import { Document, Schema, Model, model } from 'mongoose';

// An interface that describes the properties required to create a new ticket
interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

// An interface that describes the properties a Ticket Model has
interface TicketModel extends Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

// An interface that describes the properties a ticket Document has
export interface TicketDoc extends Document {
  id: string;
  title: string;
  price: number;
  userId: string;
  orderId?: string;
  version: number;
}

const ticketSchema = new Schema<TicketDoc, TicketModel>(
  {
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    orderId: {
      type: String
    }
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      }
    }
  }
);

ticketSchema.set('versionKey', 'version');

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

ticketSchema.pre('save', function (next) {
  this.version = this.version + 1;
  next();
});

const Ticket = model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
