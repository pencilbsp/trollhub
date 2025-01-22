import { ArrowUpIcon } from 'lucide-react';
import { ControllerRenderProps, useFormContext } from 'react-hook-form';
import { forwardRef, useCallback, useRef, useImperativeHandle } from 'react';

import { BorderTrail } from './ui/border-trail';

interface Props {
    placeholder?: string;
    field: ControllerRenderProps;
    onSubmit: (data: any) => void;
}

const CommentEditorInput = forwardRef<HTMLTextAreaElement, Props>(({ field, placeholder, onSubmit }, ref) => {
    const inputRef = useRef<HTMLTextAreaElement | null>(null);

    useImperativeHandle(ref, () => inputRef.current as HTMLTextAreaElement);

    const methods = useFormContext();
    const {
        formState: { isSubmitting, isDirty },
    } = methods;

    const adjustTextareaHeight = useCallback(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
    }, [inputRef]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (field.value.trim()) {
                methods.handleSubmit(onSubmit)();
            }
        }
    };

    return (
        <div className="relative flex w-full flex-col rounded-2xl border border-border bg-card p-3">
            {isSubmitting && <BorderTrail size={120} className="bg-gradient-to-l from-blue-200 via-blue-500 to-blue-200 dark:from-blue-400 dark:via-blue-500 dark:to-blue-700" />}
            <textarea
                rows={1}
                {...field}
                ref={inputRef}
                onKeyDown={handleKeyDown}
                onInput={adjustTextareaHeight}
                placeholder={placeholder || 'Thêm bình luận của bạn...'}
                className="w-full resize-none bg-transparent outline-none focus:outline-none active:outline-none"
            />
            <div className="mt-2 flex w-full items-center justify-between">
                <div className="flex items-center gap-x-2">{/* Buttons */}</div>
                <button
                    type="submit"
                    disabled={isSubmitting || !isDirty || !field.value.trim()}
                    className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-foreground p-1.5 text-background disabled:cursor-default disabled:opacity-50"
                >
                    <ArrowUpIcon strokeWidth={3} />
                </button>
            </div>
        </div>
    );
});

CommentEditorInput.displayName = 'CommentEditorInput';

export default CommentEditorInput;
