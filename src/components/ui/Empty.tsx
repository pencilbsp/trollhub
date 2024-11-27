import { cn } from '@/lib/utils';

export default function Empty({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn('select-none border rounded-2xl border-dashed px-4 py-6 text-center text-muted-foreground font-light', className)}>{children}</div>;
}
