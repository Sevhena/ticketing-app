import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  UnauthorizedError
} from '@svraven/tks-common';
import { Ticket } from '../models/ticket';

const router = express.Router();

router
  .route('/api/tickets/:id')
  .put(
    requireAuth,
    [
      body('title').not().isEmpty().withMessage('Title is required'),
      body('price')
        .isFloat({ gt: 0 })
        .withMessage('Price must be greater than zero')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
      const ticket = await Ticket.findById(req.params.id);

      if (!ticket) {
        throw new NotFoundError();
      }

      if (ticket.userId !== req.currentUser!.id) {
        throw new UnauthorizedError();
      }

      ticket.set({
        title: req.body.title,
        price: req.body.price
      });

      await ticket.save();

      res.send(ticket);
    }
  );

export { router as updateTicketRouter };
