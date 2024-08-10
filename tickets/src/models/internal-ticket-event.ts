import { Schema, model, Model } from 'mongoose';
import {
  Event,
  InternalEventDoc,
  InternalEventModel,
  EventData,
  Subjects,
  EventStatus
} from '@svraven/tks-common';

import TicketEventEmitter from '../events/events-emitter';

// An interface that describes the properties a InternalEvent Document has
export interface TicketEventDoc extends InternalEventDoc {
  id: string;
  subject: Subjects;
  data: EventData;
  createdAt: Date;
  updatedAt: Date;
  status: EventStatus;
}

const internalTicketEventSchema = new Schema<
  TicketEventDoc,
  InternalEventModel
>(
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

internalTicketEventSchema.static('build', <T extends Event>(attrs: T) => {
  return new TicketEvent(attrs);
});

const TicketEvent = model<TicketEventDoc, InternalEventModel>(
  'TicketEvent',
  internalTicketEventSchema
);

internalTicketEventSchema.pre('save', () => {
  TicketEventEmitter.emitTicketEvent();
});

export { TicketEvent };
