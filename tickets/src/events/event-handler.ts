import { AbstractEventHandler, Subjects } from '@svraven/tks-common';
import {
  TicketCreatedPublisher,
  TicketUpdatedPublisher,
  TicketDeletedPublisher
} from './publishers';
import { natsWrapper } from './nats-wrapper';

export class TicketEventHandler extends AbstractEventHandler {
  selectPublisher(subject: Subjects) {
    switch (subject) {
      case Subjects.TicketCreated:
        return new TicketCreatedPublisher(natsWrapper.client);
      case Subjects.TicketUpdated:
        return new TicketUpdatedPublisher(natsWrapper.client);
      case Subjects.TicketDeleted:
        return new TicketDeletedPublisher(natsWrapper.client);
      default:
        throw new Error('Publisher not defined');
    }
  }
}
