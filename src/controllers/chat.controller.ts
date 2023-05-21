import { NextFunction, Request, Response } from 'express';
import { chatService } from '../services';

export const getChats = async (
  req: Request & { username: string },
  res: Response,
  next: NextFunction
) => {
  try {
    const chats = await chatService.getChats(req.username);

    res.status(200).json(chats);
  } catch (error) {
    next(error);
  }
};
