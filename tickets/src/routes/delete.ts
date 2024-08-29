import express, { Request, Response } from 'express';
import {
  BadRequestError,
  NotFoundError,
  requireAuth,
  Subjects,
  UnauthorizedError
} from '@svraven/tks-common';
import mongoose from 'mongoose';

import { Ticket } from '../models/ticket';
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

    if (ticket.orderId) {
      throw new BadRequestError('Cannot delete a reserved ticket');
    }

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      await ticket.set({ active: false }).save();

      await createTicketEvent(Subjects.TicketDeleted, ticket).save();

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
