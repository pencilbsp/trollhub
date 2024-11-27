import { Prisma } from '@prisma/client';
import { createSlice } from '@reduxjs/toolkit';

import type { Comment } from '@/types/comment';

interface CommentState {
    take: number;
    total: number;
    isMore: boolean;
    isLoading: boolean;
    comments: Comment[];
    sort: Prisma.SortOrder;
}

const initialState: CommentState = {
    take: 6,
    total: 0,
    comments: [],
    sort: 'desc',
    isMore: false,
    isLoading: false,
};

export const initializeComments = () => {
    return {
        type: 'comments/initializeComments',
    };
};

export const commentSlice = createSlice({
    name: 'comments',
    initialState,
    reducers: {
        loadComments: (state, action) => {
            state.isLoading = true;
            if (typeof action.payload.sort === 'string') {
                state.sort = action.payload.sort;
            }
        },
        setComments: (state, action) => {
            state.total = action.payload.total;
            state.comments = action.payload.list;
            state.isMore = action.payload.isMore;
            state.isLoading = false;
        },
        appendComments: (state, action) => {
            state.comments = [...state.comments, ...action.payload.list];
            state.total = action.payload.total;
            state.isMore = action.payload.isMore;
            state.isLoading = false;
        },
        addNewComment: (state, action) => {
            if (action.payload.commentId) {
                // Thêm reply
                const parentComment = state.comments.find((comment) => comment.id === action.payload.commentId);
                if (parentComment) {
                    parentComment.replyCount += 1;
                    parentComment.replies[state.sort === 'desc' ? 'unshift' : 'push'](action.payload);
                }
            } else {
                // Thêm comment mới
                state.comments[state.sort === 'desc' ? 'unshift' : 'push'](action.payload);
                state.total += 1;
            }
        },
        deleteComment: (state, action) => {
            const { id, commentId } = action.payload;
            if (commentId) {
                // Xóa reply
                const parentComment = state.comments.find((comment) => comment.id === commentId);
                if (parentComment) {
                    parentComment.replyCount -= 1;
                    parentComment.replies = parentComment.replies.filter((reply) => reply.id !== id);
                }
            } else {
                // Xóa comment chính
                state.comments = state.comments.filter((comment) => comment.id !== id);
                state.total -= 1;
            }
        },
        updateCommentLike: (state, action) => {
            const { id, commentId } = action.payload;
            if (commentId) {
                // Update like cho reply
                const parentComment = state.comments.find((comment) => comment.id === commentId);
                if (parentComment) {
                    const reply = parentComment.replies.find((r) => r.id === id);
                    if (reply) {
                        reply.isLiked = !reply.isLiked;
                        reply.totalLike += reply.isLiked ? 1 : -1;
                    }
                }
            } else {
                // Update like cho comment chính
                const comment = state.comments.find((comment) => comment.id === id);
                if (comment) {
                    comment.isLiked = !comment.isLiked;
                    comment.totalLike += comment.isLiked ? 1 : -1;
                }
            }
        },
        addNewReply: (state, action) => {
            const { commentId, reply } = action.payload;
            const comment = state.comments.find((comment) => comment.id === commentId);
            if (comment) {
                comment.replyCount += 1;
                comment.replies[state.sort === 'desc' ? 'unshift' : 'push'](reply);
            }
        },
        appendReplies: (state, action) => {
            const { commentId, replies } = action.payload;
            const comment = state.comments.find((comment) => comment.id === commentId);
            if (comment) {
                comment.replies = [...comment.replies, ...replies];
            }
        },
    },
});

export const { setComments, appendComments, addNewComment, updateCommentLike, appendReplies, loadComments, deleteComment } = commentSlice.actions;
