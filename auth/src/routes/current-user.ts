import express from 'express';

const router = express.Router();

router.route('/api/users/currentuser').get((req, res) => {
  res.status(200).json({
    message: `Here's your data.`,
  });
});

export { router as currentUserRouter };
