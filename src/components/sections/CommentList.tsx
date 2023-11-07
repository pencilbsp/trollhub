"use client";

import useSWR from "swr";
import { useMemo, useTransition } from "react";
import { useSession } from "next-auth/react";

import getComments from "@/actions/getComments";

import Comment from "@/components/Comment";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import SpinerIcon from "@/components/icons/SpinerIcon";
import CommentEditor from "@/components/CommentEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

interface Props {
  contentId: string;
}

const defaultData: any = { list: [], isMore: false, options: { take: 6, skip: 0, sort: "desc" } };

export const fetcher = (id: string) => getComments(id);

export default function CommentList({ contentId }: Props) {
  const { data: session } = useSession();
  const { data, isLoading, mutate } = useSWR(contentId, fetcher);
  const comment = useMemo(() => data || defaultData, [data]);
  const [isPending, startTransition] = useTransition();

  const handleAddCommnet = (newComment: any) => {
    mutate({ ...comment, list: [newComment, ...comment.list] }, { revalidate: false });
  };

  const handleDeleteCommnet = (did: string) => {
    mutate({ ...comment, list: comment.list.filter((c: any) => c.id !== did) }, { revalidate: false });
  };

  const handleSortCommnet = async (sort: any) => {
    const sorted = await getComments(contentId, { sort });
    mutate(sorted, { revalidate: false });
  };

  const handleLoadMoreCommnet = async () => {
    if (isPending) return;
    const sortComments = await getComments(contentId, { sort: comment.sort as any, skip: comment.list.length });
    mutate(
      { ...comment, list: [...comment.list, ...sortComments.list], isMore: sortComments.isMore },
      { revalidate: false }
    );
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
        {/* @ts-ignore */}
        {session && <CommentEditor user={session.user} contentId={contentId} onNewComment={handleAddCommnet} />}

        <div className="flex flex-col gap-y-4 mb-4">
          {comment.list.map((comment: any) => (
            <Comment
              // @ts-ignore
              data={comment}
              key={comment.id}
              currentUser={session?.user}
              onCommentDeleted={handleDeleteCommnet}
            />
          ))}
        </div>

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
