"use server";

import { object, string } from "yup";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";

import { escape } from "html-escaper";

import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const commentSchema = object({
  text: string().required("Bình luận phải có nội dung").max(2000, "Bình luận không được quá 2000 ký tự"),
  sticker: string().nullable(),
  userId: string().required(""),
});

export type NewComment = Prisma.CommentUncheckedCreateInput;

export default async function createComment(data: NewComment) {
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

    return { data: newComment };
  } catch (error: any) {
    console.log("createCommentError:", error);
    return { error: error.message as string };
  }
}
