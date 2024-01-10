"use client"

import { toast } from "sonner"
import { useTransition } from "react"
import { ChapterStatus } from "@prisma/client"

import LoadingButton from "@/components/LoadingButton"
import { resetChapterStatus } from "@/actions/chapterActions"
import { useRouter } from "next/navigation"

type Props = {
  id: string
  status: ChapterStatus
}

export default function ReloadButton({ id, status }: Props) {
  const { refresh } = useRouter()
  const [pending, startTransition] = useTransition()

  const onClick = () =>
    startTransition(async () => {
      const result = await resetChapterStatus(id)
      if (result.error) {
        toast.error(result.error.message)
      } else {
        toast.success(result.message)
        refresh()
      }
    })

  return (
    <LoadingButton isLoading={pending} onClick={onClick}>
      Thử lại ngay
    </LoadingButton>
  )
}
