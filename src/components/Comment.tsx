import { toast } from 'sonner';
import { User } from 'next-auth';
import { ArrowLeft, CornerLeftDownIcon, HeartIcon } from 'lucide-react';
import { memo, useEffect, useRef, useState, useTransition } from 'react';

import useComment, { type Comment } from '@/hooks/use-comment';
import { avatarNameFallback, cn, formatToNow } from '@/lib/utils';
import { deleteComment, getComments, likeComment } from '@/actions/guest/comment-actions';

import CommentEditor from '@/components/comment-editor';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Props {
    index: number;
    comment: Comment;
    contentId: string;
    currentUser?: User;
}

function Comment({ comment, currentUser, contentId }: Props) {
    const { id, replyCount, replies } = comment;
    const { sort, take, appendReplies } = useComment(contentId);

    const [showInput, setShowInput] = useState(false);
    const [isLoading, startLoadingReplies] = useTransition();

    const replyRef = useRef<HTMLTextAreaElement>(null);

    const handleLoadReplies = () =>
        startLoadingReplies(async () => {
            if (!isLoading) {
                const result = await getComments(id, { isReply: true, skip: replies.length, take, sort });
                appendReplies(id, result.list);
            }
        });

    useEffect(() => {
        if (replyRef.current) {
            replyRef.current.focus();
        }
    }, [showInput]);

    return (
        <div className="space-y-3">
            <div className="relative">
                <CommentItem contentId={contentId} comment={comment} showInput={showInput} currentUser={currentUser} onShowInput={() => setShowInput(!showInput)} />
            </div>

            {currentUser && showInput && (
                <div className="relative pl-12">
                    <CommentEditor ref={replyRef} commentId={id} avatarSize="small" user={currentUser} contentId={contentId} placeholder="Phản hồi của bạn..." />
                </div>
            )}

            {replies.length > 0 &&
                replies.map((reply: any) => <CommentItem key={reply.id} comment={reply} contentId={contentId} showInput={showInput} currentUser={currentUser} />)}

            {replyCount - replies.length > 0 && (
                <div className={cn('relative pl-12 text-sm text-primary/70', showInput && 'pb-2')}>
                    {isLoading ? (
                        <TextShimmer
                            duration={1}
                            as="button"
                            className="relative flex items-center before:mr-2 before:inline-block before:h-[1px] before:w-8 before:bg-border before:content-[''] hover:underline"
                        >
                            {`Xem thêm ${replyCount - replies.length} phản hồi...`}
                        </TextShimmer>
                    ) : (
                        <button
                            className="relative flex items-center before:mr-2 before:inline-block before:h-[1px] before:w-8 before:bg-border before:content-[''] hover:underline"
                            onClick={handleLoadReplies}
                        >
                            {`Xem thêm ${replyCount - replies.length} phản hồi`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

type CommentItemProps = {
    comment: Comment;
    contentId: string;
    currentUser?: User;
    showInput?: boolean;
    onShowInput?: () => void;
};

const CommentItem = ({ comment, currentUser, showInput, onShowInput, contentId }: CommentItemProps) => {
    const { id, user, createdAt, text, isLiked, totalLike, commentId } = comment;
    const { deleteComment: onDeleted, likeComment: onLiked } = useComment(contentId);
    const [isLiking, startLiking] = useTransition();
    const [isDeleting, startDeleting] = useTransition();

    const handleDeleteComment = () =>
        startDeleting(async () => {
            if (!isDeleting && user.id === currentUser?.id) {
                const result = await deleteComment(id);
                if (result.error) {
                    toast.error(result.error.message);
                } else {
                    onDeleted(id);
                }
            }
        });

    const handleLikeCommnet = () =>
        startLiking(async () => {
            if (!isLiking && currentUser) {
                const result = await likeComment(currentUser.id, id, commentId);
                if (result.error) {
                    toast.error(result.error.message);
                } else {
                    onLiked(id, commentId);
                }
            }
        });

    return (
        <div className={cn('relative flex space-x-3', commentId && 'pl-12')}>
            <Avatar className={'border-2'} size={commentId ? 'lg' : 'default'}>
                <AvatarImage src={user.image} />
                <AvatarFallback>{avatarNameFallback(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex w-full flex-col">
                <span className="text-sm font-bold text-primary/70">{user.name}</span>

                <p>{text}</p>

                <div className="flex w-full justify-between">
                    <div className="mt-1 flex items-center space-x-3 text-sm font-light md:space-x-4">
                        <span className="truncate font-light text-primary/70">{formatToNow(createdAt)}</span>
                        {currentUser && !commentId && (
                            <button onClick={onShowInput} className="flex flex-shrink-0 items-center text-primary">
                                {currentUser && showInput ? <CornerLeftDownIcon className="mr-1 w-4" /> : <ArrowLeft className="mr-1 w-4" />}
                                Phản hồi
                            </button>
                        )}
                    </div>

                    <div className="flex items-center rounded-full border px-2">
                        <button disabled={!currentUser} onClick={handleLikeCommnet} className="flex items-center text-primary/70">
                            <HeartIcon className={cn('mr-1 w-4', isLiked && 'fill-rose-500 stroke-rose-400')} />
                            {totalLike}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(Comment);
