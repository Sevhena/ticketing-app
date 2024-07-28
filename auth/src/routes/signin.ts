import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { validateRequest } from '../middlewares/validate-request';
import { BadRequestError } from '../errors/bad-request-error';
import { Password } from '../utils/password';
import { User } from '../models/user';

const router = express.Router();

router
  .route('/api/users/signin')
  .post(
    [
      body('email').isEmail().withMessage('Email must be valid'),
      body('password')
        .trim()
        .notEmpty()
        .withMessage('You must supply a password')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
      const { email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        throw new BadRequestError('Invalid credentials');
      }

      const passwordsMatch = await Password.compare(
        existingUser.password,
        password
      );

      if (!passwordsMatch) {
        throw new BadRequestError('Invalid credentials');
      }

      // Generate JWT
      const payload = { id: existingUser.id, email: existingUser.email };
      const secretKey = process.env.JWT_KEY!; // '!' Tells typescript not to worry about undefined

      const userJwt = jwt.sign(payload, secretKey);

      // Store it on session object
      req.session = {
        jwt: userJwt
      };

      res.status(200).json({ status: 'Success', existingUser });
    }
  );

export { router as signinRouter };
