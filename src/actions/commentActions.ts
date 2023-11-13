"use server";

import { object, string } from "yup";
import { escape } from "html-escaper";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";

import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const commentSchema = object({
  text: string().required("Bình luận phải có nội dung").max(2000, "Bình luận không được quá 2000 ký tự"),
  sticker: string().nullable(),
  userId: string().required(""),
});

export type NewComment = Prisma.CommentUncheckedCreateInput;

export async function createComment(data: NewComment) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Đăng nhập để sử dụng tính năng bình luận");
    if (session.user.id !== data.userId) throw new Error("Tư cách người dùng không xác định");

    data.text = escape(data.text.trim());
    await commentSchema.validate(data, { strict: true, stripUnknown: true });

    const newComment = await prisma.comment.create({
      data,
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    const [liked, totalLike] = await prisma.comment.liked(newComment.id, session.user.id);
    return { data: { ...newComment, liked: liked ? true : false, totalLike } };
  } catch (error: any) {
    return { error: { message: error.message as string } };
  }
}

export async function deleteComment(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Đăng nhập để xoá bình luận này");

    const comment = await prisma.comment.findUnique({ where: { id }, select: { userId: true } });
    if (!comment) throw new Error("Bình luận không tồn tại hoặc đã bị xoá");
    if (comment.userId !== session.user.id) throw new Error("Tư cách người dùng không xác định");

    await prisma.comment.delete({ where: { id } });
    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message as string } };
  }
}

export async function likeComment(userId: string, commentId: string, liked: boolean) {
  try {
    if (liked) return unlikeComment(userId, commentId);

    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Đăng nhập để thích bình luận này");
    if (session.user.id !== userId) throw new Error("Tư cách người dùng không xác định");

    await prisma.userLikeComment.create({
      data: {
        userId,
        commentId,
      },
    });

    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message as string } };
  }
}

export async function unlikeComment(userId: string, commentId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("Đăng nhập để bỏ thích bình luận này");
  if (session.user.id !== userId) throw new Error("Tư cách người dùng không xác định");

  try {
    await prisma.userLikeComment.delete({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    return { error: null };
  } catch (error: any) {
    return { error: { message: error.message as string } };
  }
}

interface Options {
  take?: number;
  skip?: number;
  sort?: Prisma.SortOrder;
}

const defaultOptions: Options = { take: 6, skip: 0, sort: "desc" };

export async function getComments(contentId: string, options?: Options) {
  const session = await getServerSession(authOptions);
  let { take, sort, skip } = options || defaultOptions;

  if (!sort) sort = "desc";
  if (!take || take < 1) take = defaultOptions.take;
  if (!skip || skip < 0) skip = defaultOptions.skip;

  const total = await prisma.comment.count({ where: { contentId } });

  const comments = await prisma.comment.findMany({
    where: {
      contentId,
    },
    take,
    skip,
    orderBy: {
      createdAt: sort,
    },
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
  });

  const commentsWithLike = await Promise.all(
    comments.map(async (comment) => {
      const data = await prisma.comment.liked(comment.id, session?.user.id);
      return { ...comment, liked: data[0] ? true : false, totalLike: data[1] };
    })
  );

  const isMore = total > commentsWithLike.length + skip!;
  return { list: commentsWithLike, isMore, total, options: { take, skip, sort } };
}
