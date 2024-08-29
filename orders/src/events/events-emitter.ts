import EventEmitter from 'events';

class OrderEventEmitter extends EventEmitter {
  emitOrderEvent() {
    this.emit(process.env.NATS_EVENT!);
  }
}

export const eventsEmitter = new OrderEventEmitter();
