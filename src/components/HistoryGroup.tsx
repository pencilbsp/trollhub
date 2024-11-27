import slug from 'slug';
import Link from 'next/link';
import { isToday } from 'date-fns';

import { Trash2Icon } from 'lucide-react';

import { History } from '@/actions/historyActions';
import { cn, formatDate, formatToNow } from '@/lib/utils';

import Thumbnail from './Thumbnail';
import { Button } from './ui/Button';

type Props = {
    name: string;
    isLatest: boolean;
    histories: History[];
    onDelete: (id: string) => void;
};

export default function HistoryGroup({ name, isLatest, histories, onDelete }: Props) {
    const today = isToday(new Date(name));

    return (
        <div className="flex flex-col md:flex-row relative w-full gap-x-16 pb-8 pl-8 md:pl-0">
            <div className={cn('absolute top-3 bottom-0 border-dashed border-l-2 left-1 md:left-36', isLatest && 'line-mask top-0')} />

            <div className="sticky md:relative min-w-28 md:top-0 z-20 top-20">
                <div className="relative md:sticky md:top-20 flex">
                    <div className="flex items-center md:items-start space-x-2 md:space-x-0 md:flex-col mb-3 rounded-full border md:border-none px-2.5 py-0.5 md:px-0 bg-background/40 backdrop-blur-xl">
                        <div className="font-medium text-lg">{today ? 'Hôm nay' : formatDate(name, 'dd MMM')}</div>
                        <div className="text-muted-foreground">{formatDate(name, 'EEEE')}</div>
                    </div>

                    <div className="absolute flex items-center top-3 left-[-33px] md:left-auto md:right-[-39px] justify-center">
                        <div className="flex items-center justify-center">
                            <div className="w-3 h-3 bg-background rounded-full border-[2px] border-gray-300" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col space-y-4 mt-3">
                {histories.map(({ id, content, updatedAt, chapter }) => {
                    const href = `/${content.type}/${slug(content.title)}-${content.id}`;
                    const chapterHref = `/${content.type === 'movie' ? 'episode' : 'chapter'}/${slug(content.title)}-${chapter.id}`;

                    return (
                        <div key={id} className="flex">
                            <Thumbnail
                                ratio="3/4"
                                alt={content.title}
                                thumbUrl={content.thumbUrl!}
                                adultContent={content.adultContent}
                                className="max-w-[110px] rounded-xl border-2 mt-0 overflow-hidden object-cover"
                            />
                            <div className="flex flex-col ml-3 w-full">
                                <div className="flex flex-col space-y-2">
                                    <time className="text-xs md:text-base text-muted-foreground">{today ? formatToNow(updatedAt) : formatDate(updatedAt)}</time>
                                    <Link href={href}>
                                        <p className="font-semibold text-sm md:text-base lg:text-lg line-clamp-2">{chapter.title}</p>
                                    </Link>
                                    <Link href={chapterHref}>
                                        <h3 className="text-xs md:text-sm line-clamp-1">{content.title}</h3>
                                    </Link>
                                </div>
                                <div className="flex gap-x-3 justify-end w-full mt-auto">
                                    <Button variant="outline" asChild>
                                        <Link href={chapterHref}>Tiếp tục</Link>
                                    </Button>
                                    <Button variant="outline" onClick={() => onDelete(id)} className="text-red-500 hover:text-red-500">
                                        <Trash2Icon size={18} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
