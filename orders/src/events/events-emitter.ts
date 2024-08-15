import EventEmitter from 'events';

class OrderEventEmitter extends EventEmitter {
  emitOrderEvent() {
    this.emit('newOrderEvent');
  }
}

export const eventsEmitter = new OrderEventEmitter();
