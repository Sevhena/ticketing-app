import EventEmitter from 'events';

class TicketEventEmitter extends EventEmitter {
  emitTicketEvent() {
    this.emit('newTicketEvent');
  }
}

export default new TicketEventEmitter();
