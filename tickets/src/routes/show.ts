import express, { Request, Response } from 'express';
import { NotFoundError } from '@svraven/tks-common';

import { Ticket } from '../models/ticket';

const router = express.Router();

router.route('/api/tickets/:id').get(async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new NotFoundError();
  }

  res.status(200).json(ticket);
});

export { router as showTicketRouter };
