import { ValidationError } from 'joi';
import { StatusError } from '../utils';
import { NextFunction, Request, Response } from 'express';

export const errorHandler = (
  error: Error | StatusError | ValidationError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof StatusError) {
    res.status(error.status).json({ message: error.message });
  } else if (error instanceof ValidationError) {
    res.status(400).json({ message: error.message });
  } else {
    console.error(error);
    res.sendStatus(500);
  }
};
