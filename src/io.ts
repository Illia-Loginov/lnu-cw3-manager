import { Server, Socket } from 'socket.io';
import { socketVerifyToken } from './middlewares';
import { BadRequestError, NotFoundError, StatusError, prisma } from './utils';
import { serverConfig } from './config';
import { Prisma } from '@prisma/client';

export const initIo = (server) => {
  const io = new Server(server, {
    cors: {
      origin: serverConfig.frontendUrl
    }
  });

  io.use(socketVerifyToken);

  io.on('connection', (socket: Socket & { username: string }) => {
    const handleError = (error: Error) => {
      if (error instanceof StatusError) {
        io.to(socket.username).emit('error', error.message);
      } else {
        console.error(error);
        io.to(socket.username).emit('error', 'Server error');
      }
    };

    const joinRooms = async () => {
      const chatIds = (
        await prisma.chat.findMany({
          where: {
            members: {
              some: {
                username: socket.username
              }
            }
          },
          select: {
            id: true
          }
        })
      ).map((chat) => chat.id);

      socket.join(socket.username);
      for (const chatId of chatIds) {
        socket.join(chatId);
      }
    };

    socket.on('error', (error) => {
      console.error(error);
    });

    socket.on('createChat', async ({ withUsername }) => {
      try {
        if (socket.username === withUsername) {
          throw new BadRequestError('Cannot create chat with yourself');
        }

        const secondMember = await prisma.user.findFirst({
          where: {
            username: withUsername
          }
        });

        if (!secondMember) {
          throw new NotFoundError('User not found');
        }

        const chat = await prisma.chat.create({
          data: {
            members: {
              connect: [socket.username, withUsername].map((username) => ({
                username
              }))
            }
          },
          include: {
            members: {
              select: {
                username: true
              }
            },
            messages: {
              orderBy: {
                createdAt: Prisma.SortOrder.asc
              },
              select: {
                content: true,
                createdAt: true,
                id: true,
                senderUsername: true
              }
            }
          }
        });

        socket.join(chat.id);
        io.to(socket.username).emit('newChat', chat);
        io.to(withUsername).emit('newChat', chat);
      } catch (error) {
        handleError(error);
      }
    });

    socket.on('joinChat', async ({ chatId }) => {
      try {
        const chat = await prisma.chat.findFirst({
          where: {
            id: chatId,
            members: {
              some: {
                username: socket.username
              }
            }
          }
        });

        if (!chat) {
          throw new NotFoundError('You are not a member of this chat');
        }

        socket.join(chatId);
      } catch (error) {
        handleError(error);
      }
    });

    socket.on('message', async ({ content, chatId }) => {
      try {
        const chat = await prisma.chat.findFirst({
          where: {
            id: chatId,
            members: {
              some: {
                username: socket.username
              }
            }
          }
        });

        if (!chat) {
          throw new NotFoundError('You are not a member of this chat');
        }

        const message = await prisma.message.create({
          data: {
            content,
            chatId,
            senderUsername: socket.username
          }
        });

        io.to(chatId).emit('message', message);
      } catch (error) {
        handleError(error);
      }
    });

    joinRooms();
  });
};
