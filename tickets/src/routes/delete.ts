import express, { Request, Response } from 'express';
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  UnauthorizedError
} from '@svraven/tks-common';
import { Ticket } from '../models/ticket';

const router = express.Router();

router
  .route('/api/tickets:id')
  .delete(requireAuth, async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new UnauthorizedError();
    }

    ticket.deleteOne();

    res.sendStatus(204);
  });
