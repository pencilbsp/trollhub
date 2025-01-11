'use server';

import { object, string } from 'yup';
import { escape } from 'html-escaper';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';

import prisma from '@/lib/prisma';
import authOptions from '@/lib/auth';

const commentSchema = object({
    text: string().required('Bình luận phải có nội dung').max(2000, 'Bình luận không được quá 2000 ký tự'),
    sticker: string().nullable(),
    userId: string().required(''),
    commentId: string().optional().nullable(),
});

export interface NewComment extends Prisma.CommentUncheckedCreateInput {
    commentId?: string;
}

export async function createComment(data: NewComment) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) throw new Error('Đăng nhập để sử dụng tính năng bình luận');
        if (session.user.id !== data.userId) throw new Error('Tư cách người dùng không xác định');

        data.text = escape(data.text.trim());
        await commentSchema.validate(data, { strict: true, stripUnknown: true });

        if (data.commentId) {
            // @ts-ignore
            data.contentId = undefined;
        }

        // @ts-ignore
        const comment = await prisma[data.commentId ? 'reply' : 'comment'].create({
            data,
            include: { user: { select: { id: true, name: true, image: true } } },
        });

        // const [liked, totalLike] = await prisma.comment.isLiked(comment.id, session.user.id);
        return { data: { ...comment, isLiked: false, totalLike: 0, replies: [] } };
    } catch (error: any) {
        return { error: { message: error.message as string } };
    }
}

export async function deleteComment(id: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) throw new Error('Đăng nhập để xoá bình luận này');

        const comment = await prisma.comment.findUnique({ where: { id }, select: { userId: true } });
        if (!comment) throw new Error('Bình luận không tồn tại hoặc đã bị xoá');
        if (comment.userId !== session.user.id) throw new Error('Tư cách người dùng không xác định');

        await prisma.comment.delete({ where: { id } });
        return { error: null };
    } catch (error: any) {
        return { error: { message: error.message as string } };
    }
}

export async function likeComment(userId: string, id: string, parentId?: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) throw new Error('Đăng nhập để thích bình luận này');
        if (session.user.id !== userId) throw new Error('Tư cách người dùng không xác định');

        const model = parentId ? 'userLikeReply' : 'userLikeComment';
        const where = parentId ? { userId_replyId: { userId, replyId: id } } : { userId_commentId: { userId, commentId: id } };

        // @ts-ignore
        const liked = await prisma[model].findUnique({ where });
        if (liked) {
            // @ts-ignore
            await prisma[model].delete({ where: { id: liked.id } });
        } else {
            const data = parentId ? { userId, replyId: id } : { userId, commentId: id };
            // @ts-ignore
            await prisma[model].create({ data });
        }

        return { error: null };
    } catch (error: any) {
        return { error: { message: error.message as string } };
    }
}

interface Options {
    select?: any;
    take?: number;
    skip?: number;
    isReply?: boolean;
    sort?: Prisma.SortOrder;
}

const defaultOptions: Options = {
    take: 6,
    skip: 0,
    sort: 'desc',
    isReply: false,
    select: {
        id: true,
        text: true,
        userId: true,
        sticker: true,
        createdAt: true,
        user: {
            select: {
                id: true,
                name: true,
                image: true,
            },
        },
    },
};

export async function getComments(contentId: string, options?: Options) {
    const session = await getServerSession(authOptions);
    let { take, sort, skip, isReply } = options || defaultOptions;

    if (!sort) sort = 'desc';
    if (!take || take < 1) take = defaultOptions.take;
    if (!skip || skip < 0) skip = defaultOptions.skip;

    let total = 0;
    let comments: any = [];

    if (isReply) {
        total = await prisma.reply.count({ where: { commentId: contentId } });
        comments = await prisma.reply.findMany({
            where: {
                commentId: contentId,
            },
            take,
            skip,
            orderBy: {
                createdAt: sort,
            },
            select: {
                ...defaultOptions.select,
                commentId: true,
            },
        });
    } else {
        total = await prisma.comment.count({ where: { contentId } });
        comments = await prisma.comment.findMany({
            where: {
                contentId,
            },
            take,
            skip,
            orderBy: {
                createdAt: sort,
            },
            select: defaultOptions.select,
        });
    }

    const commentsWithLike = await Promise.all(
        comments.map(async (comment: any) => {
            // @ts-ignore
            const data = await prisma[isReply ? 'reply' : 'comment'].isLiked(comment.id, session?.user.id);
            return { ...comment, isLiked: data[0] ? true : false, totalLike: data[1], replyCount: data[2] || 0, replies: [] };
        }),
    );

    const isMore = total > commentsWithLike.length + skip!;
    return { list: commentsWithLike, isMore, total, options: { take, skip, sort } };
}
