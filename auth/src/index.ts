import express from 'express';
import { json } from 'body-parser';
import 'express-async-errors';
import mongoose from 'mongoose';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-founf-error';

const app = express();
app.use(json());

// ROUTERS
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

mongoose
  .connect('mongodb://auth-mongo-srv:27017/auth')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error(err));

app.listen(3000, () => {
  console.log('Listening on port 3000...');
});
