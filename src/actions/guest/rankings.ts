'use server';

import prisma from '../lib/prisma';
import { getContentMostViews } from '../lib/update-view';

export default async function getRankingContents(queryString: string) {
    try {
        const query = new URLSearchParams(queryString);

        let type = query.get('type') as any;
        let end = Number(query.get('end') || 10);
        let start = Number(query.get('start') || 0);

        if (!['content', 'chapter'].includes(type)) {
            type = 'content';
        }

        if (end < 0 || end < start) {
            end = 10;
        }

        if (start < 0) {
            start = 0;
        }

        const keys = await getContentMostViews(type);
        const resultKeys = keys.slice(start, end);
        // @ts-ignore
        const contents = await prisma[type].findMany({
            where: {
                id: {
                    in: resultKeys.map(({ id }) => id),
                },
            },
            select:
                type === 'content'
                    ? {
                          id: true,
                          fid: true,
                          type: true,
                          title: true,
                          akaTitle: true,
                          thumbUrl: true,
                          updatedAt: true,
                          creator: {
                              select: {
                                  name: true,
                                  avatar: true,
                                  userName: true,
                              },
                          },
                      }
                    : {
                          id: true,
                          fid: true,
                          type: true,
                          title: true,
                          updatedAt: true,
                      },
        });

        return {
            data: resultKeys.map((key) => {
                return {
                    ...key,
                    ...contents.find(({ id }: any) => id === key.id),
                };
            }),
            total: keys.length,
        };
    } catch (error) {
        return { error: { message: 'Đã có lỗi xảy ra, vui lòng thử lại sau.' }, data: [], total: 0 };
    }
}
