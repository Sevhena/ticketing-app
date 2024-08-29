import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects
} from '@svraven/tks-common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: ExpirationCompleteEvent['subject'] = Subjects.ExpirationComplete;
}
