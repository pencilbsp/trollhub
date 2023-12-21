"use client"

import ContentCard from "../ContentCard"
import LoadingButton from "../LoadingButton"
import useCreatorContents from "@/hooks/useCreatorContents"

type Props = {
  skip: number
  take: number
  creatorId: string
}

export default function LoadMoreContent({ creatorId, skip, take }: Props) {
  const { contents, loadMore, hasMore, isLoading } = useCreatorContents(creatorId, take, skip)

  return (
    <div className="flex flex-col items-center mt-4 w-full gap-y-6">
      {contents.length > 0 && (
        <div className="grid grid-cols-2 grid-rows-4 sm:grid-cols-3 sm:grid-rows-3 lg:grid-cols-4 lg:grid-rows-2 gap-4 md:gap-2 xl:gap-4 w-full">
          {contents.map((content: any) => (
            <ContentCard direction="vertical" key={content.id} data={content} />
          ))}
        </div>
      )}

      {hasMore && (
        <LoadingButton
          disabled={isLoading}
          isLoading={isLoading}
          onClick={() => loadMore()}
          loadingText="Đang tải thêm nội dung"
        >
          Hiện thị thêm
        </LoadingButton>
      )}
    </div>
  )
}
