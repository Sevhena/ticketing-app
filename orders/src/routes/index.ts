import express, { Request, Response } from 'express';
import { Order } from '../models/order';
import { requireAuth } from '@svraven/tks-common';

const router = express.Router();

router
  .route('/api/orders')
  .get(requireAuth, async (req: Request, res: Response) => {
    const orders = await Order.find({ userId: req.currentUser!.id }).populate(
      'ticket'
    );

    res.json(orders);
  });

export { router as indexOrderRouter };
