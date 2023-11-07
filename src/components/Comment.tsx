import { User } from "next-auth";
import { vi } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";

import { Comment } from "@prisma/client";
import deleteComment from "@/actions/deleteComment";
import { AlertTriangleIcon, MoreHorizontalIcon, TrashIcon } from "lucide-react";

import { avatarNameFallback } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useTransition } from "react";
import SpinerIcon from "./icons/SpinerIcon";

export interface CommentWithUser extends Comment {
  user: {
    id: string;
    name: string;
    image?: string;
  };
}

interface Props {
  currentUser?: User;
  data: CommentWithUser;
  onCommentDeleted: (id: string) => void;
}

export default function Comment({ data, currentUser, onCommentDeleted }: Props) {
  const { id, user, createdAt, text } = data;
  const [isPending, startTransition] = useTransition();

  const handleDeleteComment = async () => {
    if (isPending) return;
    const result = await deleteComment(id);
    if (result.error) return console.log(result.error);
    onCommentDeleted(id);
  };

  return (
    <div className="flex gap-2">
      <Avatar className="w-10 h-10 border">
        {user.image && <AvatarImage src={user.image} />}
        <AvatarFallback>{avatarNameFallback(user.name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-y-1 w-full">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-semibold">{user.name}</span>
            <span className="px-1">&#8226;</span>
            <time className="text-xs text-gray-700">
              {formatDistanceToNow(createdAt, { locale: vi, includeSeconds: true, addSuffix: true })}
            </time>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full hover:bg-border p-1 focus:outline-none focus:ring-0">
              {isPending ? <SpinerIcon /> : <MoreHorizontalIcon size={20} />}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-44">
              <DropdownMenuItem>
                Báo cáo bình luận
                <DropdownMenuShortcut>
                  <AlertTriangleIcon size={18} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              {currentUser && currentUser.id === user.id && (
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500"
                  onClick={() => startTransition(handleDeleteComment)}
                >
                  Xoá bình luận
                  <DropdownMenuShortcut>
                    <TrashIcon size={18} />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <p className="text-foreground/70">{text}</p>
        </div>
        <div className="flex gap-x-3 text-sm text-foreground/70 font-semibold">
          <button className="hover:underline">Thích</button>
          <button className="hover:underline">Trả lời</button>
        </div>
      </div>
    </div>
  );
}
