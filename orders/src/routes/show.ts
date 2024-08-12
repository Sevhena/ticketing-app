import express, { Request, Response } from 'express';
import {
  BadRequestError,
  NotFoundError,
  requireAuth,
  UnauthorizedError
} from '@svraven/tks-common';

import { Order } from '../models/order';

const router = express.Router();

router
  .route('/api/orders/:orderId')
  .get(requireAuth, async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new UnauthorizedError();
    }

    res.status(200).json(order);
  });

export { router as showOrderRouter };
