'use client';

import LoadingButton from '@/components/LoadingButton';
import { ContentVertical } from '@/components/ContentCard';
import useCreatorContents from '@/hooks/useCreatorContents';

type Props = {
    skip: number;
    take: number;
    creatorId: string;
};

export default function LoadMoreContent({ creatorId, skip, take }: Props) {
    const { contents, loadMore, hasMore, isLoading } = useCreatorContents(creatorId, take, skip);

    return (
        <div className="flex flex-col items-center mt-4 w-full gap-y-6">
            {contents.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-2 xl:gap-4 w-full">
                    {contents.map((content: any) => (
                        <ContentVertical key={content.id} data={content} />
                    ))}
                </div>
            )}

            {hasMore && (
                <LoadingButton variant="outline" onClick={loadMore} disabled={isLoading} isLoading={isLoading} loadingText="Đang tải thêm nội dung...">
                    Hiện thị thêm nội dung
                </LoadingButton>
            )}
        </div>
    );
}
