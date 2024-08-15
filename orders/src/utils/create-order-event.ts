import { EventStatus, Subjects } from '@svraven/tks-common';
import { OrderEvent, OrderEventDoc } from '../models/order-event';
import { OrderDoc } from '../models/order';

export const createOrderEvent = (
  order: OrderDoc,
  subject: Subjects
): OrderEventDoc => {
  return OrderEvent.build({
    subject,
    status: EventStatus.PENDING,
    data: {
      id: order.id,
      userId: order.userId,
      orderStatus: order.orderStatus,
      expiresAt: order.expiresAt.toISOString(),
      version: order.version,
      ticket: order.ticket
    }
  });
};
