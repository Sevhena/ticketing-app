import EventEmitter from 'events';

class OrderEventEmitter extends EventEmitter {
  emitOrderEvent() {
    this.emit('newOrderEvent');
  }
}

export default new OrderEventEmitter();
