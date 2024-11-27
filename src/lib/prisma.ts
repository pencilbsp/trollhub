import { PrismaClient } from '@prisma/client';

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

declare global {
    namespace globalThis {
        var prisma: PrismaClientSingleton;
    }
}

const prismaClientSingleton = () => {
    const __prisma = new PrismaClient().$extends({
        model: {
            comment: {
                async isLiked(commentId: string, userId?: string) {
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
                        __prisma.reply.count({ where: { commentId } }),
                    ]);
                },
            },
            reply: {
                async isLiked(replyId: string, userId?: string) {
                    return Promise.all([
                        userId
                            ? __prisma.userLikeReply.findUnique({
                                  where: {
                                      userId_replyId: {
                                          userId,
                                          replyId,
                                      },
                                  },
                                  select: {
                                      id: true,
                                  },
                              })
                            : false,
                        __prisma.userLikeReply.count({
                            where: {
                                replyId,
                            },
                        }),
                    ]);
                },
            },
        },
    });

    return __prisma;
};

let prismaGlobal: PrismaClientSingleton | null = null;

if (typeof window === 'undefined') {
    if (process.env.NODE_ENV === 'production') {
        prismaGlobal = prismaClientSingleton();
    } else {
        if (!global.prisma) {
            global.prisma = prismaClientSingleton();
        }

        prismaGlobal = global.prisma;
    }
}

export default prismaGlobal as PrismaClientSingleton;
