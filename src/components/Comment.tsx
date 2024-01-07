import { toast } from "sonner"
import { User } from "next-auth"
import { memo, useTransition } from "react"

import { deleteComment, likeComment } from "@/actions/commentActions"
import { AlertTriangleIcon, MoreHorizontalIcon, TrashIcon } from "lucide-react"

import { avatarNameFallback, cn, formatToNow } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuShortcut,
} from "@/components/ui/DropdownMenu"
import SpinerIcon from "./icons/SpinerIcon"
import { Comment } from "@/hooks/useComment"

interface Props {
  currentUser?: User
  data: Comment
  onCommentDeleted: (id: string) => void
  onCommentLiked: (id: string, liked: boolean) => void
}

function Comment({ data, currentUser, onCommentDeleted, onCommentLiked }: Props) {
  const { id, user, createdAt, text, liked, totalLike } = data
  const [isPending, startTransition] = useTransition()

  const handleDeleteComment = async () => {
    if (!isPending && user) {
      const result = await deleteComment(id)
      if (result.error) toast.error(result.error.message)
      else onCommentDeleted(id)
    }
  }

  const handleLikeCommnet = async () => {
    if (!isPending && currentUser) {
      const result = await likeComment(currentUser.id, id, liked)
      if (result.error) toast.error(result.error.message)
      else onCommentLiked(id, !liked)
    }
  }

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
            <time className="text-xs text-gray-700">{formatToNow(createdAt)}</time>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full hover:bg-border p-1 focus:outline-none focus:ring-0">
              {isPending ? <SpinerIcon /> : <MoreHorizontalIcon size={20} />}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="text-sm" align="end">
              <DropdownMenuItem>
                Báo cáo bình luận
                <DropdownMenuShortcut className="ml-4">
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
        {currentUser && (
          <div className="flex gap-x-3 text-sm text-foreground/70 font-semibold">
            <button onClick={handleLikeCommnet} className={cn(["hover:underline", liked && "text-blue-500"])}>
              Thích ({totalLike})
            </button>
            {/* <button className="hover:underline">Trả lời</button> */}
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(Comment)
