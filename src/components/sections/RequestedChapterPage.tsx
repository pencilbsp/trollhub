'use client';

import slug from 'slug';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Session } from 'next-auth';
import { ChevronLeft, ChevronRight, ListFilter } from 'lucide-react';

import { DropdownMenu, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuCheckboxItem } from '@/components/ui/DropdownMenu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { avatarNameFallback, formatDate } from '@/lib/utils';
import useRequestedChapters from '@/hooks/useRequestedChapters';

import { filterable } from '@/config';
import SpinerIcon from '../icons/SpinerIcon';

type Props = {
    session: Session | null;
};

export default function RequestedChapterPage({ session }: Props) {
    const [sort, setSort] = useState('createdAt_desc');
    const [tab, setTab] = useState(session ? 'own' : 'all');

    const { handleNext, handlePrev, requests, start, end, total, nextDisabled, prevDisabled, isLoading } = useRequestedChapters({
        sort,
        type: tab as any,
    });

    return (
        <div className="container p-4 sm:px-8 xl:max-w-7xl">
            <Tabs value={tab} onValueChange={setTab}>
                <div className="flex items-center">
                    <TabsList>
                        <TabsTrigger value="all">Tất cả</TabsTrigger>
                        <TabsTrigger value="own" disabled={!session}>
                            Của tôi
                        </TabsTrigger>
                    </TabsList>

                    <div className="ml-auto flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-7 gap-1">
                                    <ListFilter className="h-3.5 w-3.5" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Sắp xếp</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Sắp xếp theo</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {filterable.map(({ label, key, disabled }) => (
                                    <DropdownMenuCheckboxItem key={key} checked={sort === key} onClick={() => setSort(key)} disabled={isLoading || disabled(tab)}>
                                        {label}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Pagination className="ml-auto mr-0 w-auto">
                            <PaginationContent>
                                <PaginationItem>
                                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={handlePrev} disabled={prevDisabled}>
                                        <ChevronLeft className="h-3.5 w-3.5" />
                                        <span className="sr-only">Previous Order</span>
                                    </Button>
                                </PaginationItem>
                                <PaginationItem>
                                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={handleNext} disabled={nextDisabled}>
                                        <ChevronRight className="h-3.5 w-3.5" />
                                        <span className="sr-only">Next Order</span>
                                    </Button>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
                <TabsContent value={tab}>
                    <TooltipProvider>
                        <Card className="bg-card">
                            <CardHeader className="flex-col items-start space-y-1.5 p-4 md:p-6 border-b">
                                <CardTitle className="text-lg">Nội dung đã yêu cầu</CardTitle>
                                <CardDescription>Xem lại các yêu cầu và trạng thái cập nhật</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading && (
                                    <div className="w-full flex flex-col justify-center items-center py-6 space-y-3">
                                        <SpinerIcon />
                                        <p>Đang tải dữ liệu...</p>
                                    </div>
                                )}

                                {!isLoading && requests.length === 0 && <p className="text-center py-6">Không có dữ liệu.</p>}

                                {!isLoading && requests.length > 0 && (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="hidden w-[100px] sm:table-cell px-4 md:px-6">
                                                    <span className="sr-only">Image</span>
                                                </TableHead>
                                                <TableHead className="px-4 md:px-6">Tên</TableHead>
                                                <TableHead className="text-right px-4 md:px-6">Trạng thái</TableHead>
                                                <TableHead className="hidden md:table-cell text-right px-4 md:px-6">Người yêu cầu</TableHead>
                                                <TableHead className="hidden lg:table-cell text-right px-4 md:px-6">Thời gian</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {requests.map(({ id, content, title, status, user, createdAt, type, cid, count }: any) => {
                                                const href = `/${type === 'movie' ? 'episode' : 'chapter'}/${slug(content.title || '')}-${cid}`;
                                                return (
                                                    <TableRow key={id}>
                                                        <TableCell className="hidden sm:table-cell px-4 md:px-6">
                                                            <Image
                                                                unoptimized
                                                                width="56"
                                                                height="56"
                                                                alt="Product image"
                                                                src={content.thumbUrl}
                                                                className="aspect-square rounded-md object-cover border"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="max-w-72 px-4 md:px-6">
                                                            <Link href={href}>
                                                                <p className="truncate">{title}</p>
                                                                <p className="font-medium text-base truncate">{content.title}</p>
                                                            </Link>
                                                        </TableCell>
                                                        <TableCell align="right" className="px-4 md:px-6">
                                                            <Badge
                                                                variant={status === 'done' ? 'success' : status === 'rejected' ? 'destructive' : 'outline'}
                                                                className="capitalize"
                                                            >
                                                                {status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell px-4 md:px-6" align="right">
                                                            {user ? (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Avatar className="w-8 h-8 hover:cursor-pointer">
                                                                            <AvatarImage src={user.image} alt={user.name} />
                                                                            <AvatarFallback>{avatarNameFallback(user.name)}</AvatarFallback>
                                                                        </Avatar>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>{user.name}</TooltipContent>
                                                                </Tooltip>
                                                            ) : (
                                                                count
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="hidden lg:table-cell px-4 md:px-6" align="right">
                                                            {createdAt && formatDate(createdAt)}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                            <CardFooter className="p-4 md:p-6 pt-0 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Hiển thị <strong>{`${start}-${end}`}</strong> của <strong>{total}</strong> yêu cầu
                                </div>
                            </CardFooter>
                        </Card>
                    </TooltipProvider>
                </TabsContent>
            </Tabs>
        </div>
    );
}
