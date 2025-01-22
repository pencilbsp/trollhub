'use client';

import LoadingButton from '@/components/loading-button';
import { ContentVertical } from '@/components/content-card';
import useCreatorContents from '@/hooks/use-creator-contents';

type Props = {
    skip: number;
    take: number;
    creatorId: string;
};

export default function LoadMoreContent({ creatorId, skip, take }: Props) {
    const { contents, loadMore, hasMore, isLoading } = useCreatorContents(creatorId, take, skip);

    return (
        <div className="mt-4 flex w-full flex-col items-center gap-y-6">
            {contents.length > 0 && (
                <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:gap-2 lg:grid-cols-4 xl:gap-4">
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
