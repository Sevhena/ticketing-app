import express, { Request, Response } from 'express';
import {
  EventStatus,
  NotFoundError,
  requireAuth,
  Subjects,
  UnauthorizedError
} from '@svraven/tks-common';

import { Ticket } from '../models/ticket';
import mongoose from 'mongoose';
import { TicketEvent } from '../models/internal-ticket-event';
import { createTicketEvent } from '../utils/create-ticket-event';

const router = express.Router();

router
  .route('/api/tickets/:id')
  .delete(requireAuth, async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new UnauthorizedError();
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      await ticket.deleteOne();

      const ticketEvent = createTicketEvent(Subjects.TicketDeleted, ticket);

      await ticketEvent.save();

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }

    res.sendStatus(204);
  });

export { router as deleteTicketRouter };
