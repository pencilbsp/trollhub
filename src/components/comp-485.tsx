'use client';

import Image from 'next/image';
import { ContentStatus } from '@prisma/client';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, CircleAlert, CircleX, Ellipsis, Plus, Trash, Search } from 'lucide-react';
import { Row, FilterFn, ColumnDef, flexRender, SortingState, useReactTable, getCoreRowModel, getSortedRowModel, OnChangeFn } from '@tanstack/react-table';

import { cn, formatDate } from '@/lib/utils';
import { ArrayElement } from '@/types/utils';
import { type SearchArgs } from '@/lib/prisma';
import { getContents } from '@/actions/admin/content';

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
    DropdownMenuSub,
    DropdownMenuItem,
    DropdownMenuGroup,
    DropdownMenuPortal,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuShortcut,
    DropdownMenuSeparator,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Custom filter function for multi-column searching
const multiColumnFilterFn: FilterFn<Item> = (row, columnId, filterValue) => {
    const searchableRowContent = `${row.original.title} ${row.original.id}`.toLowerCase();
    const searchTerm = (filterValue ?? '').toLowerCase();
    return searchableRowContent.includes(searchTerm);
};

const statusFilterFn: FilterFn<Item> = (row, columnId, filterValue: string[]) => {
    if (!filterValue?.length) return true;
    const status = row.getValue(columnId) as string;
    return filterValue.includes(status);
};

const args = {
    select: {
        id: true,
        fid: true,
        title: true,
        status: true,
        thumbUrl: true,
        akaTitle: true,
        updatedAt: true,
        chapter: { orderBy: { createdAt: 'desc' }, take: 1, select: { title: true, id: true } },
    },
} as const satisfies SearchArgs;

type Item = ArrayElement<NonNullable<Awaited<ReturnType<typeof getContents<typeof args>>>['data']>>;

const columns: ColumnDef<Item>[] = [
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
        filterFn: multiColumnFilterFn,
        cell: ({ row }) => (
            <div className="flex items-center gap-3 max-w-md">
                <div className="rounded overflow-hidden border flex-shrink-0 w-10 h-10">
                    <Image unoptimized src={row.original.thumbUrl!} width={40} height={40} alt={row.original.title} />
                </div>
                <div>
                    <p className="font-medium line-clamp-1">{row.original.title}</p>
                    <span className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{row.original.akaTitle.join(', ')}</span>
                </div>
            </div>
        ),
    },
    {
        size: 80,
        header: 'Trạng thái',
        accessorKey: 'status',
        filterFn: statusFilterFn,
        meta: { className: 'hidden md:table-cell' },
        cell: ({ row }) => <Badge className={cn(row.original.status === ContentStatus.complete && 'bg-muted-foreground/60 text-primary-foreground')}>{row.original.status}</Badge>,
    },
    {
        enableSorting: false,
        accessorKey: 'chapter',
        header: 'Chap mới nhất',
        meta: { className: 'hidden lg:table-cell' },
        cell: ({ row }) => {
            const chapter = row.original.chapter[0];
            return chapter ? <div className="line-clamp-1">{chapter.title}</div> : null;
        },
    },
    {
        accessorKey: 'updatedAt',
        header: 'Cập nhật lần cuối',
        meta: { className: 'hidden sm:table-cell' },
        cell: ({ row }) => {
            return <span className="font-mono truncate max-w-32">{formatDate(row.original.updatedAt)}</span>;
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

export default function Component() {
    const id = useId();

    const inputRef = useRef<HTMLInputElement>(null);
    //we need a reference to the scrolling element for logic down below
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const [take] = useState(20);
    const [search, setSearch] = useState('');

    const [sorting, setSorting] = useState<SortingState>([{ id: 'updatedAt', desc: true }]);

    const { data, isFetching, fetchNextPage } = useInfiniteQuery({
        queryKey: [
            'admin_contents',
            search,
            sorting, //refetch when sorting changes
        ],
        queryFn: async ({ pageParam = 0 }) => {
            const skip = pageParam * take;
            const orderBy = { [sorting[0].id]: sorting[0].desc ? 'desc' : 'asc' };
            const result = await getContents({ where: { search }, ...args, take, skip, orderBy });

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

    //scroll to top of table when sorting changes
    const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
        setSorting(updater);
    };

    const table = useReactTable({
        data: flatData,
        columns,
        state: {
            sorting,
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: handleSortingChange,
        manualSorting: true,
        debugTable: true,
    });

    return (
        <div className="flex flex-col space-y-4 h-full">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap md:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    {/* Filter by name or email */}
                    <div className="relative flex-1">
                        <Input
                            ref={inputRef}
                            id={`${id}-input`}
                            aria-label="Tìm kiếm..."
                            placeholder="Tìm kiếm..."
                            onChange={(e) => setSearch(e.target.value)}
                            value={(table.getColumn('name')?.getFilterValue() ?? '') as string}
                            className={cn('peer min-w-60 ps-9', Boolean(table.getColumn('name')?.getFilterValue()) && 'pe-9')}
                        />
                        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                            <Search size={16} strokeWidth={2} aria-hidden="true" />
                        </div>
                        {Boolean(table.getColumn('name')?.getFilterValue()) && (
                            <button
                                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Clear filter"
                                onClick={() => {
                                    table.getColumn('name')?.setFilterValue('');
                                    if (inputRef.current) {
                                        inputRef.current.focus();
                                    }
                                }}
                            >
                                <CircleX size={16} strokeWidth={2} aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Delete button */}
                    {table.getSelectedRowModel().rows.length > 0 && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline">
                                    <Trash className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
                                    Delete
                                    <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                                        {table.getSelectedRowModel().rows.length}
                                    </span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border" aria-hidden="true">
                                        <CircleAlert className="opacity-80" size={16} strokeWidth={2} />
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
                        <Plus className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
                        Add user
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div onScroll={(e) => fetchMoreOnBottomReached(e.currentTarget)} ref={tableContainerRef} className="relative w-full overflow-auto flex-1">
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
                                                    onKeyDown={(e) => {
                                                        // Enhanced keyboard handling for sorting
                                                        if (header.column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
                                                            e.preventDefault();
                                                            header.column.getToggleSortingHandler()?.(e);
                                                        }
                                                    }}
                                                    tabIndex={header.column.getCanSort() ? 0 : undefined}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {{
                                                        asc: <ChevronUp className="shrink-0 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />,
                                                        desc: <ChevronDown className="shrink-0 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />,
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

function RowActions({ row }: { row: Row<Item> }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex justify-end">
                    <Button size="icon" variant="ghost" className="shadow-none" aria-label="Edit item">
                        <Ellipsis size={16} strokeWidth={2} aria-hidden="true" />
                    </Button>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <span>Edit</span>
                        <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <span>Duplicate</span>
                        <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <span>Archive</span>
                        <DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem>Move to project</DropdownMenuItem>
                                <DropdownMenuItem>Move to folder</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Advanced options</DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>Share</DropdownMenuItem>
                    <DropdownMenuItem>Add to favorites</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <span>Delete</span>
                    <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
