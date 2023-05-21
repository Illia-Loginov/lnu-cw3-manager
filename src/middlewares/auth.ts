import { NextFunction, Request, Response } from 'express';
import { StatusError, UnauthenticatedError, prisma } from '../utils';
import { tokenConfig } from '../config';
import { JsonWebTokenError, verify } from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';

const verifyToken = async (token: string | undefined) => {
  if (!token) {
    throw new UnauthenticatedError('No access token provided');
  }

  let username;
  try {
    username = (
      verify(token, tokenConfig.accessTokenSecret) as {
        username: string;
      }
    ).username;
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new UnauthenticatedError('Invalid access token');
    } else {
      throw error;
    }
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new UnauthenticatedError('User no longer exists');
  }

  return username;
};

export const httpVerifyToken = async (
  req: Request & { username?: string },
  res: Response,
  next: NextFunction
) => {
  const token = (req.headers.authorization || '').match(
    tokenConfig.authorizationHeaderRegex
  )?.[1];

  try {
    const username = await verifyToken(token);

    req.username = username;
  } catch (error) {
    next(error);
  }

  next();
};

export const socketVerifyToken = async (
  socket: Socket & { username?: string },
  next: (error?: ExtendedError) => void
) => {
  const { token } = socket.handshake.auth;

  try {
    const username = await verifyToken(token);

    socket.username = username;
    next();
  } catch (error) {
    if (error instanceof StatusError) {
      const resError: ExtendedError = new Error(error.message);
      resError.data = { status: error.status };
      next(resError);
    } else {
      console.error(error);
      next(new Error('Server error'));
    }
  }
};
