import express from 'express';

import { currentUser } from '@svraven/tks-common';

const router = express.Router();

router.route('/api/users/currentuser').get(currentUser, (req, res) => {
  res.json({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
