import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@svraven/tks-common';

import { Ticket } from '../models/ticket';

const router = express.Router();

router
  .route('/api/tickets')
  .post(
    requireAuth,
    [
      body('title').not().isEmpty().withMessage('Title is required'),
      body('price')
        .isFloat({ gt: 0 })
        .withMessage('Price must be greater than zero')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
      const { title, price } = req.body;

      const ticket = Ticket.build({
        title,
        price,
        userId: req.currentUser!.id
      });

      await ticket.save();

      res.status(201).json(ticket);
    }
  );

export { router as createTicketRouter };
