import { toast } from 'sonner';
import { FormEvent, useTransition } from 'react';

import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import LoadingButton from './loading-button';
import { Input } from '@/components/ui/input';
import { USER_CONTENTS_HOST } from '@/config';
import { Button } from '@/components/ui/button';

export default function RequestDialog() {
    const [pending, startTransition] = useTransition();

    const onSubmit = (event: FormEvent<HTMLFormElement>) =>
        startTransition(async () => {
            try {
                event.preventDefault();
                const formData = new FormData(event.target as HTMLFormElement);
                const url = formData.get('url') as string;
                if (url) {
                    const response = await fetch(USER_CONTENTS_HOST + '/api/request-content', {
                        method: 'POST',
                        body: JSON.stringify({ url }),
                        headers: { 'Content-Type': 'application/json' },
                    });

                    const result = await response.json();
                    if (result.error) {
                        throw new Error(result.error.message);
                    }

                    toast.success(result.message);
                }
            } catch (error: any) {
                toast.error(error.message);
            }
        });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex-shrink-0">
                    Yêu cầu
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="pb-3">Yêu cầu thêm hoặc cập nhật nội dung</DialogTitle>
                    <DialogDescription className="leading-6">
                        Điền link phim, truyện, hoặc kênh mà bạn muốn chúng tôi thêm hoặc cập nhật. Quá trình yêu cầu có thể mất nhiều thời gian nếu kênh chứa nhiều nội dung, hãy
                        kiên nhẫn chờ đợi.
                    </DialogDescription>
                </DialogHeader>

                <form className="flex w-full items-center space-x-2 mt-4" onSubmit={onSubmit}>
                    <Input name="url" placeholder="Link Fuhu video, comic, novel hoặc chanel" disabled={pending} />
                    <LoadingButton type="submit" disabled={pending} isLoading={pending} className="flex-shrink-0" loadingText="Đang xử lý...">
                        Gửi yêu cầu
                    </LoadingButton>
                </form>
            </DialogContent>
        </Dialog>
    );
}
