import express, { Request, Response } from 'express';
import { stripe } from '../stripe';
import { BadRequestError, requireAuth } from '@svraven/tks-common';
import fulfillOrder from '../utils/fulfill-order';

interface SessionRequest extends Request {
  query: {
    session_id: string;
  };
}

const router = express.Router();

router
  .route('/api/payments/fulfill')
  .post(requireAuth, async (req: SessionRequest, res: Response) => {
    const sessionId = req.query.session_id;

    if (!sessionId) {
      throw new BadRequestError('You must provide a session id');
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const orderId: string = session.client_reference_id!;

    switch (session.status) {
      case 'expired' || 'open':
        res.status(400).json({
          status: session.status,
          email: session.customer_email,
          orderId
        });
      case 'complete':
        await fulfillOrder(sessionId, orderId);
        res.status(200).json({
          status: session.status,
          email: session.customer_email,
          orderId
        });
    }
  });

export { router as fulfillOrderRouter };
