import { toast } from 'sonner';
import { User } from 'next-auth';
import { ArrowLeft, CornerLeftDownIcon, HeartIcon } from 'lucide-react';
import { Fragment, memo, useEffect, useRef, useState, useTransition } from 'react';

import useComment, { type Comment } from '@/hooks/useComment';
import { avatarNameFallback, cn, formatToNow } from '@/lib/utils';
import { deleteComment, getComments, likeComment } from '@/actions/commentActions';

import CommentEditor from './CommentEditor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { TextShimmer } from './ui/TextShimmer';

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
        <div>
            <div className="relative">
                {(showInput || replyCount > 0) && (
                    <div className="bottom-0 w-0.5 p-0 m-0 absolute bg-border h-[calc(100%-2.25rem)] md:h-[calc(100%-2.75rem)] left-[0.938rem] md:left-[1.188rem]" />
                )}

                <CommentItem contentId={contentId} comment={comment} showInput={showInput} currentUser={currentUser} onShowInput={() => setShowInput(!showInput)} />
            </div>

            {currentUser && showInput && (
                <div className="pl-12 py-2 relative">
                    <Curve />
                    {replies.length > 0 && <Line />}
                    <CommentEditor ref={replyRef} commentId={id} avatarSize="small" user={currentUser} contentId={contentId} placeholder="Phản hồi của bạn..." />
                </div>
            )}

            {replies.length > 0 && (
                <div>
                    {replies.map((reply: any, index: number) => {
                        const isLast = replies.length < replyCount ? false : index === replies.length - 1;
                        return <CommentItem key={reply.id} isLast={isLast} comment={reply} contentId={contentId} showInput={showInput} currentUser={currentUser} />;
                    })}
                </div>
            )}

            {replyCount - replies.length > 0 && (
                <div className={cn('pl-12 pt-2 relative  text-sm font-light', showInput && 'pb-2')}>
                    {showInput && <Line />}
                    <Curve className="-top-1.5" />
                    {isLoading ? (
                        <TextShimmer duration={1} as="button">
                            {`Xem thêm ${replyCount - replies.length} phản hồi...`}
                        </TextShimmer>
                    ) : (
                        <button className="hover:underline" onClick={handleLoadReplies}>
                            {`Xem thêm ${replyCount - replies.length} phản hồi`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

type CommentItemProps = {
    isLast?: boolean;
    comment: Comment;
    contentId: string;
    currentUser?: User;
    showInput?: boolean;
    onShowInput?: () => void;
};

const CommentItem = ({ comment, currentUser, showInput, onShowInput, contentId, isLast }: CommentItemProps) => {
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
        <div className={cn('relative', commentId && 'pl-12 pt-2')}>
            {commentId && <Curve />}
            {commentId && !isLast && <Line />}

            <div className="flex space-x-2">
                <Avatar className={'border-2'} size={commentId ? 'lg' : 'default'}>
                    {user.image && <AvatarImage src={user.image} />}
                    <AvatarFallback>{avatarNameFallback(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col w-full">
                    <div className="border rounded-2xl py-1.5 px-3 mr-auto">
                        <span className="font-light">{user.name}</span>

                        <p className="text-foreground">{text}</p>
                    </div>
                    <div className="flex items-center mt-1 space-x-3 text-sm md:space-x-4 text-foreground font-light">
                        <button disabled={!currentUser} onClick={handleLikeCommnet} className="flex items-center">
                            <HeartIcon className={cn('w-4 mr-1', isLiked && 'fill-rose-500 stroke-rose-400')} />
                            {totalLike}
                        </button>

                        {currentUser && !commentId && (
                            <button onClick={onShowInput} className="flex items-center flex-shrink-0">
                                {currentUser && showInput ? <CornerLeftDownIcon className="w-4 mr-1" /> : <ArrowLeft className="w-4 mr-1" />}
                                Phản hồi
                            </button>
                        )}

                        <span className="truncate font-light">{formatToNow(createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Line = ({ className }: { className?: string }) => {
    return <div className={cn('top-0 w-0.5 p-0  m-0 absolute bg-border h-full left-[0.938rem] md:left-[1.188rem]', className)} />;
};

const Curve = ({ className }: { className?: string }) => {
    return <div className={cn('top-0 w-7 md:w-6 h-7 md:h-6 absolute border-l-2 border-b-2 rounded-bl-2xl p-0 m-0 left-[0.938rem] md:left-[1.188rem]', className)} />;
};

export default memo(Comment);
