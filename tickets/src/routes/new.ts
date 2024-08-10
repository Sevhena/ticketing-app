import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  EventStatus,
  requireAuth,
  Subjects,
  TicketCreatedEvent,
  validateRequest
} from '@svraven/tks-common';

import { Ticket } from '../models/ticket';
import mongoose from 'mongoose';
import { TicketEvent } from '../models/internal-ticket-event';

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

      const session = await mongoose.startSession();

      try {
        session.startTransaction();
        const ticket = Ticket.build({
          title,
          price,
          userId: req.currentUser!.id
        });

        await ticket.save();

        const ticketEvent = TicketEvent.build<TicketCreatedEvent>({
          subject: Subjects.TicketCreated,
          status: EventStatus.PENDING,
          data: {
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            id: ticket.id,
            version: ticket.version
          }
        });

        await ticketEvent.save();

        await session.commitTransaction();
        res.status(201).json(ticket);
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    }
  );

export { router as createTicketRouter };
