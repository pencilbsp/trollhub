import { ArrayElement } from '@/types/utils';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { getComments as getCommentsAction } from '@/actions/commentActions';
import {
    setComments,
    updateCommentLike,
    loadComments as loadCommentsSlice,
    addNewComment as addNewCommentSlice,
    appendReplies as appendRepliesSlice,
    deleteComment as deleteCommentSlice,
    appendComments as appendCommentsSlice,
} from '@/store/features/commentSlice';
import { Prisma } from '@prisma/client';

type FallbackData = Awaited<ReturnType<typeof getCommentsAction>>;
export interface Comment extends ArrayElement<FallbackData['list']> {
    commentId?: string;
}

export default function useComment(contentId: string) {
    const dispatch = useAppDispatch();
    const { isLoading, isMore, total, comments, sort, take } = useAppSelector(
        (state: {
            comments: {
                take: number;
                total: number;
                isMore: boolean;
                isLoading: boolean;
                comments: Comment[];
                sort: Prisma.SortOrder;
            };
        }) => state.comments,
    );

    const loadComments = async () => {
        dispatch(loadCommentsSlice({}));
        const result = await getCommentsAction(contentId, { take, sort });
        dispatch(setComments(result));
    };

    const loadMoreComments = async () => {
        dispatch(loadCommentsSlice({}));
        const result = await getCommentsAction(contentId, { skip: comments.length, take, sort });
        dispatch(appendCommentsSlice(result));
    };

    const sortComment = async (sort: Prisma.SortOrder) => {
        dispatch(loadCommentsSlice({ sort }));
        const result = await getCommentsAction(contentId, { sort, take });
        dispatch(setComments(result));
    };

    const addNewComment = async (comment: Comment) => {
        dispatch(addNewCommentSlice(comment));
    };

    const likeComment = (id: string, commentId?: string) => {
        dispatch(updateCommentLike({ id, commentId }));
    };

    const deleteComment = (id: string, commentId?: string) => {
        dispatch(deleteCommentSlice({ id, commentId }));
    };

    const appendComments = async (more: FallbackData) => {
        dispatch(appendCommentsSlice(more));
    };

    const appendReplies = (commentId: string, replies: Comment[]) => {
        dispatch(appendRepliesSlice({ commentId, replies }));
    };

    return {
        take,
        sort,
        total,
        isMore,
        comments,
        isLoading,

        sortComment,
        likeComment,
        loadComments,
        appendReplies,
        addNewComment,
        deleteComment,
        appendComments,
        loadMoreComments,
    };
}
