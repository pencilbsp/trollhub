'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

import useComment from '@/hooks/useComment';

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
                <h3 className="font-bold text-xl uppercase">Bình luận</h3>
                <Select defaultValue={sort} onValueChange={sortComment}>
                    <SelectTrigger className="w-28 h-8">
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

                <div className="flex flex-col space-y-5 my-4">
                    {comments.length > 0 ? (
                        comments.map((comment, index) => <Comment index={index} key={comment.id} comment={comment} contentId={contentId} currentUser={session?.user} />)
                    ) : (
                        <Empty>Chưa có bình luận nào</Empty>
                    )}
                </div>

                <div className="flex w-full flex-col justify-center items-center mt-4">
                    {isLoading ? (
                        <TextShimmer>Đang tải bình luận...</TextShimmer>
                    ) : (
                        isMore && (
                            <Button onClick={loadMoreComments} variant="outline" className="py-1 px-4">
                                Tải thêm bình luận
                            </Button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
