'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ContentStatus } from '@prisma/client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, CircleAlert, Ellipsis, Plus, Trash, BookOpenText, ImageIcon, Clapperboard } from 'lucide-react';
import { Row, ColumnDef, flexRender, SortingState, useReactTable, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';

import { formatToNow } from '@/lib/date';
import { DASHBOARD_PATH } from '@/config';
import { ArrayElement } from '@/types/utils';
import { getContents } from '@/actions/admin/content';
import { avatarNameFallback, cn, generateHref } from '@/lib/utils';
import { SearchArgs, type ContentFindManyArgs } from '@/lib/prisma';

import {
    AlertDialog,
    AlertDialogTitle,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogTrigger,
    AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuGroup,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuShortcut,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Search, { type SearchFilter } from '@/components/sections/admin/contents/search';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


export const args = {
    select: {
        id: true,
        fid: true,
        type: true,
        title: true,
        status: true,
        thumbUrl: true,
        akaTitle: true,
        updatedAt: true,
        creator: { select: { name: true, avatar: true, userName: true } },
        chapter: { orderBy: { createdAt: 'desc' }, take: 1, select: { title: true, id: true } },
    },
} as const satisfies SearchArgs;

export type Content = ArrayElement<NonNullable<Awaited<ReturnType<typeof getContents<typeof args>>>['data']>>;

const columns: ColumnDef<Content>[] = [
    {
        size: 28,
        id: 'select',
        enableHiding: false,
        enableSorting: false,
        header: ({ table }) => (
            <Checkbox
                aria-label="Select all"
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
            />
        ),
        cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
    },
    {
        size: 448,
        header: 'Tên',
        enableHiding: false,
        accessorKey: 'title',
        cell: ({ row }) => {
            const Icon = row.original.type === 'movie' ? Clapperboard : row.original.type === 'novel' ? BookOpenText : ImageIcon;

            return (
                <Link className="flex max-w-lg items-center gap-3" href={generateHref({ type: DASHBOARD_PATH.contents, id: row.original.id })}>
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded border">
                        <Image unoptimized src={row.original.thumbUrl!} width={40} height={40} alt={row.original.title} />
                    </div>
                    <div>
                        <div className="flex items-center">
                            <Icon width={18} className="flex-shrink-0" />
                            <p className="ml-1 line-clamp-1 text-base font-medium">{row.original.title}</p>
                        </div>
                        <span className="mt-0.5 hidden text-xs text-muted-foreground lg:line-clamp-1">{row.original.akaTitle.join(', ')}</span>
                        <span className="mt-0.5 line-clamp-1 text-xs text-muted-foreground lg:hidden">{row.original.creator.name}</span>
                    </div>
                </Link>
            );
        },
    },
    {
        size: 80,
        header: 'Trạng thái',
        accessorKey: 'status',
        meta: { className: 'hidden md:table-cell' },
        cell: ({ row }) => <Badge className={cn(row.original.status === ContentStatus.complete && 'bg-muted-foreground/60 text-primary-foreground')}>{row.original.status}</Badge>,
    },
    {
        enableSorting: false,
        accessorKey: 'creator',
        header: 'Nhà sáng tạo',
        meta: { className: 'hidden lg:table-cell' },
        cell: ({ row }) => {
            const creator = row.original.creator;
            return (
                <div className="flex items-center">
                    <Avatar className="h-8 w-8 border">
                        {creator.avatar && <AvatarImage src={creator.avatar} />}
                        <AvatarFallback>{avatarNameFallback(creator.name)}</AvatarFallback>
                    </Avatar>
                    <span className="ml-2 line-clamp-1">{creator.name}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'updatedAt',
        header: 'Cập nhật lần cuối',
        meta: { className: 'hidden sm:table-cell' },
        cell: ({ row }) => {
            const latest = row.original.chapter[0];
            return (
                <div className="flex max-w-xs flex-col gap-1">
                    {latest && <span className="line-clamp-1">{latest.title}</span>}
                    <span className="font-mono">{formatToNow(row.original.updatedAt)}</span>
                </div>
            );
        },
    },
    {
        size: 60,
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => <RowActions row={row} />,
        header: () => <span className="sr-only">Actions</span>,
    },
];

export default function Contents() {
    //we need a reference to the scrolling element for logic down below
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const [take] = useState(20);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<SearchFilter | null>(null);

    const [sorting, setSorting] = useState<SortingState>([{ id: 'updatedAt', desc: true }]);

    const { data, isFetching, fetchNextPage } = useInfiniteQuery({
        queryKey: ['admin_contents', { search, sorting, filter }],
        queryFn: async ({ pageParam = 0 }) => {
            const skip = pageParam * take;
            const orderBy = { [sorting[0].id]: sorting[0].desc ? 'desc' : 'asc' };

            const whereArgs: ContentFindManyArgs['where'] = { search };
            if (filter) {
                if (filter.status.length > 0) {
                    whereArgs.status = { in: filter.status };
                }

                if (filter.type.length > 0) {
                    whereArgs.type = { in: filter.type };
                }

                if (filter.creator) {
                    whereArgs.creatorId = { in: [filter.creator.id] };
                }

                if (filter.updatedAtRange) {
                    whereArgs.updatedAt = { gte: filter.updatedAtRange.from?.toISOString(), lte: filter.updatedAtRange.to?.toISOString() };
                }
            }

            const result = await getContents({ where: whereArgs, ...args, take, skip, orderBy });

            if (result.error) throw new Error(result.error.message);
            return result;
        },
        initialPageParam: 0,
        getNextPageParam: (_lastGroup, groups) => groups.length,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    });

    const flatData = useMemo(() => data?.pages?.flatMap((page) => page.data) ?? [], [data]);

    const totalDBRowCount = data?.pages?.[0]?.total ?? 0;
    const totalFetched = flatData.length;

    //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
    const fetchMoreOnBottomReached = useCallback(
        (containerRefElement?: HTMLDivElement | null) => {
            if (containerRefElement) {
                const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
                //once the user has scrolled within 500px of the bottom of the table, fetch more data if we can
                if (scrollHeight - scrollTop - clientHeight < 500 && !isFetching && totalFetched < totalDBRowCount) {
                    fetchNextPage();
                }
            }
        },
        [fetchNextPage, isFetching, totalFetched, totalDBRowCount],
    );

    //a check on mount and after a fetch to see if the table is already scrolled to the bottom and immediately needs to fetch more data
    useEffect(() => {
        fetchMoreOnBottomReached(tableContainerRef.current);
    }, [fetchMoreOnBottomReached]);

    const table = useReactTable({
        data: flatData,
        columns,
        state: {
            sorting,
        },
        debugTable: true,
        manualSorting: true,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="flex h-full flex-col space-y-4">
            <div className="flex justify-between gap-3">
                <Search onFilterChange={setFilter} onSearchChange={setSearch} />
                <div className="flex items-center gap-3">
                    {table.getSelectedRowModel().rows.length > 0 && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline">
                                    <Trash className="opacity-60" size={16} aria-hidden="true" />
                                    <span className="hidden md:inline-block">Xoá</span>
                                    <span className="inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                                        {table.getSelectedRowModel().rows.length}
                                    </span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border" aria-hidden="true">
                                        <CircleAlert className="opacity-80" size={16} />
                                    </div>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete {table.getSelectedRowModel().rows.length} selected{' '}
                                            {table.getSelectedRowModel().rows.length === 1 ? 'row' : 'rows'}.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    {/* Add user button */}
                    <Button variant="outline">
                        <Plus className="opacity-60" size={16} aria-hidden="true" />
                        <span className="hidden sm:inline-block">Thêm nội dung</span>
                    </Button>
                </div>
            </div>

            <div onScroll={(e) => fetchMoreOnBottomReached(e.currentTarget)} ref={tableContainerRef} className="relative w-full flex-1 overflow-auto">
                <Table className="border-separate border-spacing-0 [&_td]:border-border [&_tfoot_td]:border-t [&_th]:border-b [&_th]:border-border [&_tr:not(:last-child)_td]:border-b [&_tr]:border-none">
                    <TableHeader className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} style={{ width: `${header.getSize()}px` }} className={cn(header.column.columnDef.meta?.className)}>
                                            {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                                <div
                                                    className={cn(
                                                        header.column.getCanSort() && 'flex h-full cursor-pointer select-none items-center justify-between gap-2 truncate',
                                                    )}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    tabIndex={header.column.getCanSort() ? 0 : undefined}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {{
                                                        asc: <ChevronUp className="shrink-0 opacity-60" size={16} aria-hidden="true" />,
                                                        desc: <ChevronDown className="shrink-0 opacity-60" size={16} aria-hidden="true" />,
                                                    }[header.column.getIsSorted() as string] ?? null}
                                                </div>
                                            ) : (
                                                flexRender(header.column.columnDef.header, header.getContext())
                                            )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => {
                                        return (
                                            <TableCell key={cell.id} className={cn('last:py-0', cell.column.columnDef.meta?.className)}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function RowActions({ row }: { row: Row<Content> }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex justify-end">
                    <Button size="icon" variant="ghost" className="shadow-none" aria-label="Edit item">
                        <Ellipsis size={16} aria-hidden="true" />
                    </Button>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <span>Chỉnh sửa</span>
                        <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuItem>Quản lý chap</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <span>Lưu trữ</span>
                        <DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Đẩy lên nổi bật</DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <span>Xoá</span>
                    <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
