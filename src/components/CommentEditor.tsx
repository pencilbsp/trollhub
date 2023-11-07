"use client";

import { User } from "next-auth";
import { ClipboardEvent, FormEvent, useRef, useState, useTransition } from "react";

import { SendHorizonalIcon, StickerIcon, ImagePlusIcon } from "lucide-react";

import { avatarNameFallback } from "@/lib/utils";
import createComment from "@/actions/createComment";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";

interface Props {
  user: User;
  contentId: string;
  onNewComment: (newComment: any) => void;
}

export default function CommentEditor({ user, contentId, onNewComment }: Props) {
  const [send, setSend] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  const handlePostComment = async () => {
    if (inputRef.current?.innerText && !isPending) {
      const result = await createComment({
        contentId,
        userId: user.id,
        text: inputRef.current.innerText,
      });

      if (result.error) return console.log(result.error);

      setSend(false);
      onNewComment(result.data);
      inputRef.current.innerText = "";
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const addText = event.clipboardData.getData("text/plain");
    document.execCommand("insertHTML", false, addText);
  };

  const handleInput = (_: FormEvent<HTMLDivElement>) => {
    if (inputRef.current) {
      const text = Boolean(inputRef.current.textContent);
      send !== text && setSend(text);
    }
  };

  return (
    <div className="flex gap-2 mb-4">
      <Avatar className="w-10 h-10 border">
        {user.image && <AvatarImage src={user.image} />}
        <AvatarFallback>{avatarNameFallback(user.name!)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col w-full rounded-lg border border-input bg-background p-2">
        <div
          ref={inputRef}
          contentEditable
          onPaste={handlePaste}
          onInput={handleInput}
          className="w-full focus:outline-none text-sm pb-2"
        ></div>
        <div className="flex w-full justify-between items-center">
          <div className="flex items-center gap-x-2">
            <button className="group w-7 h-7 flex justify-center items-center rounded-full bg-muted">
              <StickerIcon className="stroke-foreground/60 group-hover:stroke-blue-500" size={18} />
            </button>
            <button className="group w-7 h-7 flex justify-center items-center rounded-full bg-muted">
              <ImagePlusIcon className="stroke-foreground/60 group-hover:stroke-blue-500" size={18} />
            </button>
          </div>
          <button
            disabled={!send || isPending}
            onClick={() => startTransition(handlePostComment)}
            className="flex items-center px-2 py-1 border rounded-md text-blue-500 text-sm disabled:cursor-not-allowed disabled:text-foreground/60"
          >
            {isPending ? "Đang đăng..." : "Bình luận"}
            <SendHorizonalIcon size={18} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
