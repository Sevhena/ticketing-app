import EventEmitter from 'events';

class TicketEventEmitter extends EventEmitter {
  emitTicketEvent() {
    this.emit(process.env.NATS_EVENT!);
  }
}

export const eventsEmitter = new TicketEventEmitter();
