import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  UnauthorizedError,
  Subjects,
  BadRequestError
} from '@svraven/tks-common';

import { Ticket } from '../models/ticket';
import mongoose from 'mongoose';
import { eventsEmitter } from '../events/events-emitter';
import { createTicketEvent } from '../utils/create-ticket-event';

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
      const session = await mongoose.startSession();

      try {
        session.startTransaction();
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
          throw new NotFoundError();
        }

        if (ticket.userId !== req.currentUser!.id) {
          throw new UnauthorizedError();
        }

        if (ticket.orderId) {
          throw new BadRequestError('Cannot edit a reserved ticket');
        }

        ticket.set({
          title: req.body.title,
          price: req.body.price
        });

        await ticket.save();

        eventsEmitter.emitTicketEvent();

        const ticketEvent = createTicketEvent(Subjects.TicketUpdated, ticket);

        ticketEvent.save();

        await session.commitTransaction();
        res.status(200).json(ticket);
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        await session.endSession();
      }
    }
  );

export { router as updateTicketRouter };
