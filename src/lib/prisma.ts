import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  const __prisma = new PrismaClient().$extends({
    model: {
      comment: {
        async liked(commentId: string, userId?: string) {
          return Promise.all([
            userId
              ? __prisma.userLikeComment.findUnique({
                  where: {
                    userId_commentId: {
                      userId,
                      commentId,
                    },
                  },
                  select: {
                    id: true,
                  },
                })
              : false,
            __prisma.userLikeComment.count({
              where: {
                commentId,
              },
            }),
          ]);
        },
      },
    },
  });

  return __prisma;
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
