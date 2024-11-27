import { Spinner } from '@/components/ui/Spinner';
import { TextShimmer } from '@/components/ui/TextShimmer';

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[99] bg-background flex items-center justify-center">
            <TextShimmer className="ml-2 text-lg">Đang tải trang...</TextShimmer>
        </div>
    );
}
