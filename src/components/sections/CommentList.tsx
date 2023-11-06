"use client";

import { useSession } from "next-auth/react";

import Comment from "../Comment";
import { Card } from "@/components/ui/Card";
import CommentEditor from "../CommentEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

interface Props {
  contentId: string;
}

export default function CommentList({ contentId }: Props) {
  const { data } = useSession();

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xl uppercase">Bình luận</h3>
        <Select defaultValue="latest">
          <SelectTrigger className="w-28 h-8">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="latest">Mới nhất</SelectItem>
            <SelectItem value="oldest">Cũ nhất</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card className="p-4 mt-4">
        {/* @ts-ignore */}
        {data?.user && <CommentEditor user={data.user} contentId={contentId} />}
        <Comment />
      </Card>
    </div>
  );
}
