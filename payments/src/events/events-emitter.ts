import EventEmitter from 'events';

class PaymentEventEmitter extends EventEmitter {
  emitPaymentEvent() {
    this.emit(process.env.NATS_EVENT!);
  }
}

export const eventsEmitter = new PaymentEventEmitter();
