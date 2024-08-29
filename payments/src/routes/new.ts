import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { stripe } from '../stripe';
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  PaymentStatus,
  requireAuth,
  Subjects,
  UnauthorizedError,
  validateRequest
} from '@svraven/tks-common';

import { Order } from '../models/order';
import { createPaymentEvent } from '../utils/create-payment-event';
import { Payment } from '../models/payment';

const router = express.Router();

router.route('/api/payments/sessions').post(
  // requireAuth,
  [body('orderId').not().isEmpty().withMessage('OrderId is required')],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId, version } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new UnauthorizedError();
    }

    if (order.orderStatus === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for a cancelled order');
    }

    try {
      const stripeSession = await stripe.checkout.sessions.create({
        customer_email: req.currentUser!.email,
        client_reference_id: order.id,
        ui_mode: 'embedded',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: order.price * 100,
              product_data: {
                name: order.ticket
              }
            },
            quantity: 1
          }
        ],
        currency: 'usd',
        mode: 'payment',
        return_url: `https://ticketing.com/orders/return?session_id={CHECKOUT_SESSION_ID}`
      });

      const payment = await Payment.build({
        orderId,
        stripeSessionId: stripeSession.id,
        status: PaymentStatus.Pending
      }).save();

      await createPaymentEvent(Subjects.AwaitingPayment, payment);

      res.send({ clientSecret: stripeSession.client_secret });
    } catch (err) {
      res.status(500).json((err as Error).message);
    }
  }
);

export { router as createSessionRouter };
