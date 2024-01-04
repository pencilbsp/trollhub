import { PrismaClient } from "@prisma/client"

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

declare global {
  namespace NodeJS {
    interface Global {
      prisma: PrismaClientSingleton
    }
  }
}

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
          ])
        },
      },
    },
  })

  return __prisma
}

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClientSingleton | undefined
// }

let prisma: PrismaClientSingleton

if (typeof window === "undefined") {
  if (process.env.NODE_ENV === "production") {
    prisma = prismaClientSingleton()
  } else {
    if (!global.prisma) {
      global.prisma = prismaClientSingleton()
    }

    prisma = global.prisma
  }
}

export default prisma
