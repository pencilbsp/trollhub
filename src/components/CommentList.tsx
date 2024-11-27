'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

import useComment from '@/hooks/useComment';

import Comment from '@/components/Comment';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import CommentEditor from '@/components/CommentEditor';
import { TextShimmer } from '@/components/ui/TextShimmer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

interface Props {
    contentId: string;
}

export default function CommentList({ contentId }: Props) {
    const current = usePathname();
    const { data: session } = useSession();
    const { comments, isMore, isLoading, sort, sortComment, loadComments, loadMoreComments } = useComment(contentId);

    useEffect(() => {
        loadComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="">
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
            <Card className="p-4 mt-4">
                {session ? (
                    <CommentEditor user={session.user} contentId={contentId} />
                ) : (
                    <p className="text-center text-lg">
                        <Link className="text-blue-500 hover:underline" href={'/login' + (current ? `?next=${decodeURIComponent(current)}` : '')}>
                            Đăng nhập
                        </Link>{' '}
                        để gửi bình luận!
                    </p>
                )}

                {
                    <div className="flex flex-col gap-y-4 my-4">
                        {comments.length > 0 &&
                            comments.map((comment, index) => <Comment index={index} key={comment.id} comment={comment} contentId={contentId} currentUser={session?.user} />)}
                    </div>
                }

                <div className="flex w-full flex-col justify-center items-center">
                    {isLoading ? (
                        <button className="flex items-center" disabled>
                            <TextShimmer>Đang tải bình luận...</TextShimmer>
                        </button>
                    ) : (
                        isMore && (
                            <Button onClick={loadMoreComments} className="w-full py-1 px-4">
                                Tải thêm bình luận
                            </Button>
                        )
                    )}
                </div>
            </Card>
        </div>
    );
}
