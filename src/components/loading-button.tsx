import { TextShimmer } from './ui/text-shimmer';
import { Button, ButtonProps } from './ui/button';

interface Props extends ButtonProps {
    className?: string;
    isLoading?: boolean;
    loadingText?: string;
    children: React.ReactNode;
}

export default function LoadingButton({ children, isLoading, className, loadingText, ...others }: Props) {
    return (
        <Button {...others} disabled={isLoading} className={className}>
            {isLoading && <TextShimmer>{loadingText || 'Đang tải...'}</TextShimmer>}
            {!isLoading && children}
        </Button>
    );
}
