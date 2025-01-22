import slug from 'slug';
import Link from 'next/link';
import { isToday } from 'date-fns';

import { Trash2Icon } from 'lucide-react';

import { History } from '@/actions/guest/history-actions';
import { cn, formatDate, formatToNow, generateHref } from '@/lib/utils';

import Thumbnail from './thumbnail';
import { Button } from './ui/button';
import { DeleteButton } from './icons/delete-button';

type Props = {
    name: string;
    isLatest: boolean;
    histories: History[];
    onDelete: (id: string) => void;
};

export default function HistoryGroup({ name, isLatest, histories, onDelete }: Props) {
    const today = isToday(new Date(name));

    return (
        <div className="relative flex w-full flex-col gap-x-16 pb-8 pl-8 md:flex-row md:pl-0">
            <div className={cn('absolute bottom-0 left-1 top-3 border-l-2 border-dashed md:left-36', isLatest && 'line-mask top-0')} />

            <div className="sticky top-20 z-20 min-w-28 md:relative md:top-0">
                <div className="relative flex md:sticky md:top-20">
                    <div className="mb-3 flex items-center space-x-2 rounded-full border bg-background/40 px-2.5 py-0.5 backdrop-blur-xl md:flex-col md:items-start md:space-x-0 md:border-none md:px-0">
                        <div className="text-lg font-medium">{today ? 'Hôm nay' : formatDate(name, 'dd MMM')}</div>
                        <div className="text-muted-foreground">{formatDate(name, 'EEEE')}</div>
                    </div>

                    <div className="absolute left-[-33px] top-3 flex items-center justify-center md:left-auto md:right-[-39px]">
                        <div className="flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full border-[2px] border-gray-300 bg-background" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-3 flex flex-1 flex-col space-y-4">
                {histories.map(({ id, content, updatedAt, chapter }) => {
                    const href = generateHref({ id: content.id, type: content.type, title: content.title });
                    const chapterHref = generateHref({ id: chapter.id, title: chapter.title, contentTitle: content.title, type: content.type });

                    return (
                        <div key={id} className="flex">
                            <Thumbnail
                                ratio="3/4"
                                alt={content.title}
                                thumbUrl={content.thumbUrl!}
                                adultContent={content.adultContent}
                                className="mt-0 max-w-[110px] overflow-hidden rounded-xl border-2 object-cover"
                            />
                            <div className="ml-3 flex w-full flex-col">
                                <div className="flex flex-col space-y-1">
                                    <time className="text-muted-foreground">{today ? formatToNow(updatedAt) : formatDate(updatedAt)}</time>
                                    <Link href={chapterHref}>
                                        <p className="line-clamp-1 font-semibold lg:text-lg">{chapter.title}</p>
                                    </Link>
                                    <Link href={href}>
                                        <h3 className="line-clamp-2">{content.title}</h3>
                                    </Link>
                                </div>
                                <div className="mt-auto flex w-full justify-end gap-x-3">
                                    <Button variant="outline" asChild>
                                        <Link href={chapterHref}>Tiếp tục</Link>
                                    </Button>
                                    <DeleteButton variant="outline" onClick={() => onDelete(id)} className="text-red-500 hover:text-red-500">
                                        <span className="ml-2">Xoá</span>
                                    </DeleteButton>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
