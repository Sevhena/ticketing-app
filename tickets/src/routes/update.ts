import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  UnauthorizedError,
  Subjects,
  EventStatus,
  TicketUpdatedEvent
} from '@svraven/tks-common';

import { Ticket } from '../models/ticket';
import mongoose from 'mongoose';
import { TicketEvent } from '../models/internal-ticket-event';
import TicketEventEmitter from '../events/events-emitter';

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

        ticket.set({
          title: req.body.title,
          price: req.body.price
        });

        await ticket.save();

        const ticketEvent = TicketEvent.build<TicketUpdatedEvent>({
          subject: Subjects.TicketUpdated,
          status: EventStatus.PENDING,
          data: {
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            id: ticket.id,
            version: ticket.version
          }
        });

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
