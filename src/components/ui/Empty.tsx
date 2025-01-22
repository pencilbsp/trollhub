import { cn } from '@/lib/utils';

export default function Empty({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn('select-none rounded-2xl border border-dashed px-4 py-6 text-center font-light text-muted-foreground', className)}>{children}</div>;
}
