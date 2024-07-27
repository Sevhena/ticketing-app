import express from 'express';

const router = express.Router();

router.post('/api/users/signout', (req, res) => {
  res.status(200).json({
    message: `You've signed out succesfully!`,
  });
});

export { router as signoutRouter };
