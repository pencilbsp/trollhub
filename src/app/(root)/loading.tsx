import { Spinner } from '@/components/ui/spinner';
import { TextShimmer } from '@/components/ui/text-shimmer';

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-background">
            <TextShimmer className="ml-2 text-lg">Đang tải trang...</TextShimmer>
        </div>
    );
}
