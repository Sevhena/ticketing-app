import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@svraven/tks-common';
import { createSessionRouter } from './routes/new';
import { fulfillOrderRouter } from './routes/fulfill';

const app = express();
app.set('trust proxy', true);
app.use(cors());
app.use(json());
app.use(
  cookieSession({
    signed: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV !== 'test'
  })
);
app.use(currentUser);

// ROUTERS
app.use(createSessionRouter);
app.use(fulfillOrderRouter);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
