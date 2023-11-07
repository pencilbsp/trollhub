"use server";

import { getServerSession } from "next-auth";

import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function deleteComment(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Đăng nhập để sử dụng tính năng bình luận");

    const comment = await prisma.comment.findUnique({ where: { id }, select: { userId: true } });
    if (!comment) throw new Error("Bình luận không tồn tại hoặc đã bị xoá");
    if (comment.userId !== session.user.id) throw new Error("Tư cách người dùng không xác định");

    await prisma.comment.delete({ where: { id } });
    return {};
  } catch (error: any) {
    console.log("createCommentError:", error);
    return { error: error.message as string };
  }
}
