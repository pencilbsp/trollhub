export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  contentId: string;
  replyCount: number;
  totalLike: number;
  isLiked: boolean;
  user: {
    name: string;
    image: string;
  };
  replies: Comment[];
}

export interface CommentResponse {
  list: Comment[];
  total: number;
  isMore: boolean;
  options: {
    take: number;
    skip: number;
    sort: 'asc' | 'desc';
  };
} 