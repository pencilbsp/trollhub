'use client';

import * as Yup from 'yup';
import { toast } from 'sonner';
import { User } from 'next-auth';
import { forwardRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import useComment from '@/hooks/use-comment';
import { createComment } from '@/actions/guest/comment-actions';
import { avatarNameFallback, cn } from '@/lib/utils';

import { Form } from '@/components/ui/form';
import CommentEditorInput from '@/components/comment-editor-input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Props {
    user: User;
    contentId: string;
    commentId?: string;
    className?: string;
    placeholder?: string;
    avatarSize?: 'small' | 'normal';
}

const schema = Yup.object({
    commentId: Yup.string().optional(),
    text: Yup.string().required('Text is required'),
    userId: Yup.string().required('User ID is required'),
    contentId: Yup.string().required('Content ID is required'),
}).required();

const CommentEditor = forwardRef<HTMLTextAreaElement, Props>(({ user, contentId, placeholder, avatarSize, commentId }, ref) => {
    const { addNewComment } = useComment(contentId);
    const methods = useForm({ defaultValues: { contentId, text: '', commentId, userId: user.id }, resolver: yupResolver(schema) });

    const { handleSubmit, control, reset } = methods;

    const onSubmit = async (data: Yup.InferType<typeof schema>) => {
        try {
            const result = await createComment(data);
            if (result.error) {
                throw new Error(result.error.message);
            } else {
                reset();
                addNewComment(result.data);
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra, vui lòng thử lại sau!');
        }
    };

    return (
        <Form className="flex space-x-3" methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Avatar className={cn('border-2', avatarSize === 'small' ? 'h-8 w-8' : 'h-10 w-10')}>
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>{avatarNameFallback(user.name)}</AvatarFallback>
            </Avatar>

            <Controller
                name="text"
                disabled={!user}
                control={control}
                render={({ field }) => <CommentEditorInput field={{ ...field }} placeholder={placeholder} ref={ref} onSubmit={onSubmit} />}
            />
        </Form>
    );
});

CommentEditor.displayName = 'CommentEditor';

export default CommentEditor;
