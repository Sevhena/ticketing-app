import { Schema, model } from 'mongoose';
import {
  InternalEventDoc,
  InternalEventModel,
  Subjects,
  EventStatus,
  TicketEvent as ITicketEvent
} from '@svraven/tks-common';

type TicketEventDoc = InternalEventDoc<ITicketEvent>;
type TicketEventModel = InternalEventModel<ITicketEvent, TicketEventDoc>;

const ticketEventSchema = new Schema<TicketEventDoc, TicketEventModel>(
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
    },
    timestamps: true
  }
);

ticketEventSchema.static('build', (attrs: ITicketEvent) => {
  return new TicketEvent(attrs);
});

const TicketEvent = model<TicketEventDoc, TicketEventModel>(
  'TicketEvent',
  ticketEventSchema
);

export { TicketEventDoc };
export { TicketEvent };
