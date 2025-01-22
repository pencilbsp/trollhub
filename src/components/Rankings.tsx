'use client';

import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import numeral from '@/lib/format-number';
import { ContentRank } from '@/types/other';
import { cn, generateHref } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import getRankingContents from '@/actions/guest/rankings';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination, PaginationItem, PaginationContent } from '@/components/ui/pagination';

const step = 10;
const fallbackData = { data: [], total: 0 };

export default function Rankings() {
    const [range, setRange] = useState({ start: 0, end: step });

    const { data, isLoading } = useSWR<{
        total: number;
        data: ContentRank[];
    }>(new URLSearchParams({ start: range.start.toString(), end: range.end.toString(), type: 'content' }).toString(), getRankingContents, {
        fallbackData,
    });

    const handleNext = () => {
        if (!isLoading && data?.total! > range.end) {
            setRange({ start: range.end, end: range.end + step });
        }
    };

    const handlePrev = () => {
        if (!isLoading && range.start >= step) {
            setRange({ start: range.start - step, end: range.start });
        }
    };

    return (
        <div>
            <div className="flex">
                <h2 className="truncate text-2xl font-bold uppercase">BXH Hôm Nay</h2>

                <Pagination className="ml-auto mr-0 w-auto">
                    <PaginationContent>
                        <PaginationItem>
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={handlePrev} disabled={isLoading || range.start < step}>
                                <ChevronLeft className="h-3.5 w-3.5" />
                                <span className="sr-only">Previous Order</span>
                            </Button>
                        </PaginationItem>
                        <PaginationItem>
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={handleNext} disabled={isLoading || data?.total! <= range.end}>
                                <ChevronRight className="h-3.5 w-3.5" />
                                <span className="sr-only">Next Order</span>
                            </Button>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>

            <Card className="mt-4">
                <CardContent className="grid gap-4 py-4">
                    {isLoading && (
                        <div className="flex w-full items-center justify-center">
                            <Spinner size="lg" />
                        </div>
                    )}

                    {!isLoading && !data?.data.length && <p className="text-center">Không có dữ liệu.</p>}

                    {!isLoading &&
                        (data?.data.length || 0) > 0 &&
                        data?.data.map(({ id, type, thumbUrl, title, view }, index) => {
                            const href = generateHref({ type, title, id });

                            return (
                                <div key={id} className="pl-4">
                                    <Link href={href} className="flex gap-3">
                                        <div className="h-12 w-12 flex-shrink-0">
                                            <Image
                                                unoptimized
                                                width={0}
                                                height={0}
                                                sizes="100vh"
                                                alt={title}
                                                src={thumbUrl}
                                                className="h-full w-full rounded-md border object-cover"
                                            />
                                        </div>
                                        <div className={cn('flex w-full items-center justify-between space-x-2 pb-1.5 pr-4', index !== data.data.length - 1 && 'border-b')}>
                                            <p className="line-clamp-2 font-medium transition-colors group-hover:text-blue-500">{title}</p>
                                            <div className="ml-auto flex-shrink-0 text-green-500">+{numeral(view || 0).format('0.0a')}</div>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                </CardContent>
            </Card>
        </div>
    );
}
