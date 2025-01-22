'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { TabletSmartphoneIcon } from 'lucide-react';

import { ContentType, Prisma } from '@prisma/client';
import { ChapterList } from '@/actions/guest/content-actions';

import numeral from '@/lib/format-number';
import { cn, formatDate, generateHref } from '@/lib/utils';

import useChapters from '@/hooks/use-chapters';

import Empty from '@/components/ui/empty';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableRow, TableBody, TableCell, TableHead, TableHeader } from '@/components/ui/table';
import { Select, SelectItem, SelectValue, SelectContent, SelectTrigger } from '@/components/ui/select';

interface Props {
    contentId: string;
    data?: ChapterList;
    currentId?: string;
    contentTitle: string;
    contentType: ContentType;
    createdAt?: Prisma.SortOrder;
    hiddenColumns?: ('view' | 'update')[];
}

export default function ChapterTable({ data, contentId, createdAt, currentId, contentType, contentTitle, hiddenColumns }: Props) {
    if (!createdAt) createdAt = 'desc';
    if (!hiddenColumns) hiddenColumns = [];

    const { chapters, setSort } = useChapters(
        contentId,
        // @ts-ignore
        data ? { data: data, total: data.length } : undefined,
    );

    const handleSort = (value: Prisma.SortOrder) => {
        setSort(value);
    };

    return (
        <div>
            <div className="mb-4 flex items-center justify-between space-x-1">
                <h3 className="truncate text-xl font-bold uppercase">{contentType === 'movie' ? 'Danh sách tập' : 'Danh sách chương'}</h3>
                <Select defaultValue={createdAt} onValueChange={handleSort}>
                    <SelectTrigger className="h-8 w-28">
                        <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent align="end">
                        <SelectItem value="desc">Mới nhất</SelectItem>
                        <SelectItem value="asc">Cũ nhất</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {chapters?.length > 0 ? (
                <Card>
                    <div className="max-h-80 overflow-y-auto">
                        <Table>
                            <TableHeader className="sticky top-0 mx-4">
                                <TableRow>
                                    <TableHead>Tên</TableHead>
                                    {!hiddenColumns.includes('update') && <TableHead className="truncate text-right">Cập nhật</TableHead>}
                                    {!hiddenColumns.includes('view') && <TableHead className="truncate text-right">Lượt xem</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* @ts-ignore */}
                                {chapters.map(({ id, title, createdAt, mobileOnly, type, view }) => {
                                    const isActive = id === currentId;
                                    const href = generateHref({ contentTitle, title, id, type });

                                    return (
                                        <ChapterRow
                                            key={id}
                                            view={view}
                                            href={href}
                                            title={title!}
                                            isActive={isActive}
                                            createdAt={createdAt}
                                            mobileOnly={mobileOnly}
                                            hiddenColumns={hiddenColumns}
                                        />
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            ) : (
                <Empty>{`Hiện tại chưa có ${contentType === 'movie' ? 'tập' : 'chương'} nào`}</Empty>
            )}
        </div>
    );
}

function scrollParentToChild(parent: HTMLElement, child: HTMLElement) {
    // Where is the parent on page
    const parentRect = parent.getBoundingClientRect();
    // What can you see?
    const parentViewableArea = {
        height: parent.clientHeight,
        width: parent.clientWidth,
    };

    // Where is the child
    const childRect = child.getBoundingClientRect();
    // Is the child viewable?
    const isViewable = childRect.top >= parentRect.top && childRect.bottom <= parentRect.top + parentViewableArea.height;

    // if you can't see the child try to scroll parent
    if (!isViewable) {
        // Should we scroll using top or bottom? Find the smaller ABS adjustment
        const scrollTop = childRect.top - parentRect.top;
        const scrollBot = childRect.bottom - parentRect.bottom;
        if (Math.abs(scrollTop) < Math.abs(scrollBot)) {
            // we're near the top of the list
            parent.scrollTop += scrollTop;
        } else {
            // we're near the bottom of the list
            parent.scrollTop += scrollBot;
        }
    }
}

type ChapterRowProps = {
    href: string;
    view: number | null;
    title: string;
    isActive: boolean;
    mobileOnly: boolean;
    createdAt: Date;
    hiddenColumns?: ('view' | 'update')[];
};

function ChapterRow({ href, isActive, mobileOnly, title, view, hiddenColumns, createdAt }: ChapterRowProps) {
    const rowRef = useRef<HTMLTableRowElement>(null);

    useEffect(() => {
        if (rowRef.current && isActive) {
            rowRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest',
            });
        }
    }, [isActive]);

    return (
        <TableRow ref={rowRef}>
            <TableCell className="max-w-md font-mono font-medium">
                <Link href={href} className={cn('flex max-w-full items-center', isActive && 'text-blue-500')}>
                    <div className="flex overflow-hidden">
                        <span className="truncate">{title.trim()}</span>
                        {mobileOnly && <TabletSmartphoneIcon size={16} className="ml-2 inline-block flex-shrink-0 text-red-400" />}
                    </div>
                    {isActive && (
                        <Badge variant="outline" className="ml-2 shrink-0 border-blue-500/70 bg-blue-500/90 px-1.5 font-sans text-background">
                            Đang xem
                        </Badge>
                    )}
                </Link>
            </TableCell>
            {!hiddenColumns!.includes('update') && (
                <TableCell className="text-right">
                    <time className="truncate font-mono text-sm font-light">{formatDate(createdAt)}</time>
                </TableCell>
            )}
            {!hiddenColumns!.includes('update') && <TableCell className="text-right font-mono">{numeral(view || 0).format('0.0a')}</TableCell>}
        </TableRow>
    );
}
