'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

import useComment from '@/hooks/use-comment';

import Empty from '@/components/ui/empty';
import Comment from '@/components/comment';
import { Button } from '@/components/ui/button';
import CommentEditor from '@/components/comment-editor';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
    contentId: string;
}

export default function CommentList({ contentId }: Props) {
    const { data: session } = useSession();
    const { comments, isMore, isLoading, sort, sortComment, loadComments, loadMoreComments } = useComment(contentId);

    useEffect(() => {
        loadComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold uppercase">Bình luận</h3>
                <Select defaultValue={sort} onValueChange={sortComment}>
                    <SelectTrigger className="h-8 w-28">
                        <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent align="end">
                        <SelectItem value="desc">Mới nhất</SelectItem>
                        <SelectItem value="asc">Cũ nhất</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="mt-4">
                {session && <CommentEditor user={session.user} contentId={contentId} />}

                <div className="my-4 flex flex-col space-y-5">
                    {comments.length > 0 ? (
                        comments.map((comment, index) => <Comment index={index} key={comment.id} comment={comment} contentId={contentId} currentUser={session?.user} />)
                    ) : (
                        <Empty>Chưa có bình luận nào</Empty>
                    )}
                </div>

                <div className="mt-4 flex w-full flex-col items-center justify-center">
                    {isLoading ? (
                        <TextShimmer>Đang tải bình luận...</TextShimmer>
                    ) : (
                        isMore && (
                            <Button onClick={loadMoreComments} variant="outline" className="px-4 py-1">
                                Tải thêm bình luận
                            </Button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
