"use client"

import { toast } from "sonner"
import { useState, useTransition } from "react"
import { AlertTriangleIcon } from "lucide-react"

import LoadingButton from "@/components/LoadingButton"
import { requestChapter } from "@/actions/chapterActions"

type Props = {
  chapterId: string
}

export default function RequestButton({ chapterId }: Props) {
  const [totalRequest, setTotalRequest] = useState(0)
  const [pending, startTransition] = useTransition()

  const handleRequest = () =>
    startTransition(async () => {
      const result = await requestChapter(chapterId)

      if (result.error) {
        toast.error(result.error.message)
      } else {
        toast.success(result.message)
        setTotalRequest(result.totalRequest)
      }
    })

  return (
    <LoadingButton isLoading={pending} loadingText="Đang yêu cầu" onClick={handleRequest} disabled={totalRequest}>
      {totalRequest ? `${totalRequest} lượt yêu cầu` : "Yêu cầu xử lý"}
      <AlertTriangleIcon className="ml-2 w-4 h-4" />
    </LoadingButton>
  )
}
