'use client';

import Link from 'next/link';
import { useEffect, useRef, Fragment, ChangeEvent } from 'react';

import { Input } from '../ui/input';

import { TabletSmartphoneIcon } from 'lucide-react';
import { cn, formatDate, generateHref } from '@/lib/utils';
import { type ChapterList } from '@/actions/contentActions';
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
                <h4 className="font-bold text-xl uppercase">Danh sách chương</h4>
                <div className="mt-2 relative">
                    <MagnifyingGlassIcon className="ml-2 h-5 w-5 opacity-50 absolute top-1/2 -translate-y-1/2" />
                    <Input onChange={onFilter} className="pl-8" placeholder="Tìm kiếm chương..." />
                </div>
            </div>
            <div className="max-h-80 w-full overflow-y-auto mb-3">
                <ul className="px-3 w-full text-sm font-mono flex flex-col divide-y" ref={liRef}>
                    {chapters.map((chap) => {
                        const { id, title, type, createdAt, mobileOnly } = chap;
                        const isCurrent = id === currentId;
                        const href = generateHref({ id, title, contentTitle, type });

                        return (
                            <li key={id} data-active={isCurrent} className={cn('hover:bg-foreground/10', isCurrent && 'bg-foreground/10 text-blue-500')}>
                                <Link href={href} className="flex justify-between p-2 gap-x-4">
                                    <div className="flex overflow-hidden">
                                        <span className="truncate">{title?.trim()}</span>
                                        {mobileOnly && <TabletSmartphoneIcon size={16} className="ml-2 text-red-400 inline-block flex-shrink-0" />}
                                    </div>
                                    <time className="font-mono font-light text-sm flex-shrink-0">{formatDate(createdAt)}</time>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </Fragment>
    );
}
