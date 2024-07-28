import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { User } from '../models/user';
import { validateRequest } from '../middlewares/validate-request';
import { BadRequestError } from '../errors/bad-request-error';

const router = express.Router();

router
  .route('/api/users/signup')
  .post(
    [
      body('email').isEmail().withMessage('Email must be valid'),
      body('password')
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('Password must be between 4 and 20 characters')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
      const { email, password } = req.body;
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        throw new BadRequestError('Email in use');
      }

      const user = User.build({ email, password });
      await user.save();

      // Generate JWT
      const payload = { id: user.id, email: user.email };
      const secretKey = process.env.JWT_KEY!; // '!' Tells typescript not to worry about undefined

      const userJwt = jwt.sign(payload, secretKey);

      // Store it on session object
      req.session = {
        jwt: userJwt
      };

      res.status(201).json({ status: 'success', user });
    }
  );

export { router as signupRouter };
