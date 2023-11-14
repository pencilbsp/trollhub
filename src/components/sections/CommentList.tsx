"use client";

import { useSession } from "next-auth/react";

import useComment from "@/hooks/useComment";

import Comment from "@/components/Comment";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import SpinerIcon from "@/components/icons/SpinerIcon";
import CommentEditor from "@/components/CommentEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

interface Props {
  contentId: string;
}

export default function CommentList({ contentId }: Props) {
  const { data: session } = useSession();
  const { comment, isLoading, sortComment, likeComment, deleteComment, loadMoreComment, addComment } =
    useComment(contentId);

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xl uppercase">Bình luận</h3>
        <Select defaultValue="desc" onValueChange={sortComment}>
          <SelectTrigger className="w-28 h-8">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="desc">Mới nhất</SelectItem>
            <SelectItem value="asc">Cũ nhất</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card className="p-4 mt-4">
        {session ? (
          <CommentEditor user={session.user} contentId={contentId} onNewComment={addComment} />
        ) : (
          <p className="text-center text-lg">Đăng nhập để gửi bình luận!!!</p>
        )}

        {
          <div className="flex flex-col gap-y-4 mb-4">
            {comment.list.length > 0 &&
              comment.list.map((comment) => (
                <Comment
                  data={comment}
                  key={comment.id}
                  currentUser={session?.user}
                  onCommentLiked={likeComment}
                  onCommentDeleted={deleteComment}
                />
              ))}
          </div>
        }

        <div className="flex w-full flex-col justify-center items-center">
          {isLoading ? (
            <button className="flex items-center">
              <SpinerIcon className="mr-1.5" />
              Đang tải bình luận...
            </button>
          ) : (
            comment.isMore && (
              <Button onClick={loadMoreComment} className="w-full py-1 px-4">
                Tải thêm bình luận
              </Button>
            )
          )}
        </div>
      </Card>
    </div>
  );
}
