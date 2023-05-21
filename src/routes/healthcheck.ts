import { NextFunction, Request, Response } from 'express';

export const healthcheck = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(200).json({ message: 'Healthy' });
};
