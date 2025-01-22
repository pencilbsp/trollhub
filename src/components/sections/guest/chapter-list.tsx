'use client';

import Link from 'next/link';
import { useEffect, useRef, Fragment, ChangeEvent } from 'react';

import { Input } from '../../ui/input';

import { TabletSmartphoneIcon } from 'lucide-react';
import { cn, formatDate, generateHref } from '@/lib/utils';
import { type ChapterList } from '@/actions/guest/content-actions';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

interface Props {
    currentId: string;
    isLoading?: boolean;
    contentTitle: string;
    chapters: ChapterList;
    onFilter?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function ChapterList({ chapters, contentTitle, currentId, onFilter }: Props) {
    const liRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        if (liRef.current) {
            const activeChap = liRef.current.querySelector('[data-active=true]');
            activeChap && activeChap.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }, []);

    return (
        <Fragment>
            <div className="m-4">
                <h4 className="text-xl font-bold uppercase">Danh sách chương</h4>
                <div className="relative mt-2">
                    <MagnifyingGlassIcon className="absolute top-1/2 ml-2 h-5 w-5 -translate-y-1/2 opacity-50" />
                    <Input onChange={onFilter} className="pl-8" placeholder="Tìm kiếm chương..." />
                </div>
            </div>
            <div className="mb-3 max-h-80 w-full overflow-y-auto">
                <ul className="flex w-full flex-col divide-y px-3 font-mono text-sm" ref={liRef}>
                    {chapters.map((chap) => {
                        const { id, title, type, createdAt, mobileOnly } = chap;
                        const isCurrent = id === currentId;
                        const href = generateHref({ id, title, contentTitle, type });

                        return (
                            <li key={id} data-active={isCurrent} className={cn('hover:bg-foreground/10', isCurrent && 'bg-foreground/10 text-blue-500')}>
                                <Link href={href} className="flex justify-between gap-x-4 p-2">
                                    <div className="flex overflow-hidden">
                                        <span className="truncate">{title?.trim()}</span>
                                        {mobileOnly && <TabletSmartphoneIcon size={16} className="ml-2 inline-block flex-shrink-0 text-red-400" />}
                                    </div>
                                    <time className="flex-shrink-0 font-mono text-sm font-light">{formatDate(createdAt)}</time>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </Fragment>
    );
}
