import { prisma } from '../../utils';
import { Prisma } from '@prisma/client';

export const getChats = async (username: string) => {
  const chats = await prisma.chat.findMany({
    where: {
      members: {
        some: {
          username: username
        }
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

  if (!chats) {
    return chats;
  }

  chats.sort((a, b) => {
    if (a.messages.length === 0 && b.messages.length === 0) {
      return 0;
    } else if (a.messages.length === 0) {
      return 1;
    } else if (b.messages.length === 0) {
      return -1;
    }

    return (
      b.messages[0].createdAt.getTime() - a.messages[0].createdAt.getTime()
    );
  });

  return chats;
};
