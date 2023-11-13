"use client";

import useSWR from "swr";
import { useTransition } from "react";
import { Prisma } from "@prisma/client";
import { useSession } from "next-auth/react";

import { getComments } from "@/actions/commentActions";

import Comment from "@/components/Comment";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import SpinerIcon from "@/components/icons/SpinerIcon";
import CommentEditor from "@/components/CommentEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

interface Props {
  contentId: string;
}

const fallbackData: any = { list: [], isMore: false, options: { take: 6, skip: 0, sort: "desc" } };

export const fetcher = (id: string) => getComments(id);

export default function CommentList({ contentId }: Props) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const { data: comment, isLoading, mutate } = useSWR(contentId, fetcher, { revalidateOnFocus: false, fallbackData });

  const handleAddCommnet = (newComment: any) => {
    mutate({ ...comment, list: [newComment, ...comment.list] }, { revalidate: false });
  };

  const handleLikeCommnet = (id: string, liked: boolean) => {
    const list = [...comment.list];
    const index = list.findIndex((comment) => comment.id === id);

    const cComment = comment.list[index];
    const totalLike = liked ? cComment.totalLike + 1 : cComment.totalLike - 1;
    list[index] = { ...cComment, liked, totalLike };
    mutate({ ...comment, list }, { revalidate: false });
  };

  const handleDeleteCommnet = (id: string) => {
    const list = [...comment.list];
    const index = list.findIndex((comment) => comment.id === id);

    list.splice(index, 1);
    mutate({ ...comment, list }, { revalidate: false });
  };

  const handleSortCommnet = async (sort: Prisma.SortOrder) => {
    const sorted = await getComments(contentId, { sort });
    mutate(sorted, { revalidate: false });
  };

  const handleLoadMoreCommnet = async () => {
    if (!isPending) {
      const moreComments = await getComments(contentId, { ...comment.options, skip: comment.list.length });
      mutate(
        { ...comment, list: [...comment.list, ...moreComments.list], isMore: moreComments.isMore },
        { revalidate: false }
      );
    }
  };

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xl uppercase">Bình luận</h3>
        <Select defaultValue="desc" onValueChange={handleSortCommnet}>
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
          <CommentEditor user={session.user} contentId={contentId} onNewComment={handleAddCommnet} />
        ) : (
          <p className="text-center text-lg">Đăng nhập để gửi bình luận!!!</p>
        )}

        {
          <div className="flex flex-col gap-y-4 mb-4">
            {comment.list?.map((comment: any, index: number) => (
              <Comment
                data={comment}
                key={comment.id}
                currentUser={session?.user}
                onCommentLiked={handleLikeCommnet}
                onCommentDeleted={handleDeleteCommnet}
              />
            ))}
          </div>
        }

        <div className="flex w-full flex-col justify-center items-center">
          {isLoading || isPending ? (
            <button className="flex items-center">
              <SpinerIcon className="mr-1.5" />
              Đang tải bình luận...
            </button>
          ) : (
            comment.isMore && (
              <Button onClick={() => startTransition(handleLoadMoreCommnet)} className="w-full py-1 px-4">
                Tải thêm bình luận
              </Button>
            )
          )}
        </div>
      </Card>
    </div>
  );
}
