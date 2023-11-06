import { vi } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";

import { MoreHorizontalIcon } from "lucide-react";

import { avatarNameFallback } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/DropdownMenu";

export default function Comment() {
  return (
    <div className="flex gap-2">
      <Avatar className="w-10 h-10 border">
        <AvatarImage src="https://lh3.googleusercontent.com/a/ACg8ocKjNy37qyLsaBljKwi2avTsuDv9kChp8phMzkKLgm55mYU=s96-c" />
        <AvatarFallback>{avatarNameFallback("Vu Thong")}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-y-1">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-semibold">Vũ Thống</span>
            <span className="px-1">&#8226;</span>
            <time className="text-xs text-gray-700">
              {formatDistanceToNow(new Date("11/01/2023"), { locale: vi, includeSeconds: true, addSuffix: true })}
            </time>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full hover:bg-border p-1">
              <MoreHorizontalIcon size={20} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Báo cáo bình luận</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <p className="text-foreground/70">
            🆘 Hiện tại có rất nhiều đối tượng SPAM link, mọi người chú ý KHÔNG CLICK vào để tránh bị mất Facebook nhé
            😷
          </p>
        </div>
        <div className="flex gap-x-3 text-sm text-foreground/70 font-semibold">
          <button className="hover:underline">Thích</button>
          <button className="hover:underline">Trả lời</button>
        </div>
      </div>
    </div>
  );
}
