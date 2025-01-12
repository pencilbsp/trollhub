'use client';

import { useMemo, useState, useTransition } from 'react';
import {
    ColumnDef,
    SortingState,
    useReactTable,
    VisibilityState,
    getCoreRowModel,
    getSortedRowModel,
    getFacetedRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
    getPaginationRowModel,
    getFacetedUniqueValues,
    PaginationState,
} from '@tanstack/react-table';
import useSWR from 'swr';

const defaultData: any = { data: [], total: 0 };

export default function useTable<TData, TValue>(
    key: string,
    columns: ColumnDef<TData, TValue>[],
    fetcher: (options: any) => Promise<{ data: TData[]; total: number }>,
    options: {
        page?: number;
        limit?: number;
        orderBy?: any;
        initData?: { data: TData[]; total: number };
    },
) {
    const [pending, startTransition] = useTransition();
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: options.page || 0,
        pageSize: options.limit || 10,
    });
    const [orderBy, setOrderBy] = useState(options.orderBy || { createdAt: 'desc' });
    const [rowSelection, setRowSelection] = useState({});
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const { data, mutate } = useSWR(key, () => defaultData, {
        fallbackData: options.initData || defaultData,
        revalidateOnMount: false,
        revalidateOnFocus: false,
    });

    const loadData = (pagination: PaginationState) =>
        startTransition(async () => {
            const result = await fetcher(pagination);
            mutate(result, { revalidate: false });
        });

    const onPaginationChange = (e: any) => {
        setPagination((pre) => {
            const newState = e(pre);
            loadData(newState);
            return newState;
        });
    };

    const table = useReactTable({
        data: data?.data || [],
        columns,
        state: {
            sorting,
            pagination,
            rowSelection,
            columnFilters,
            columnVisibility,
        },
        manualPagination: true,
        enableRowSelection: true,
        onSortingChange: setSorting,
        pageCount: Math.ceil((data?.total || 0) / pagination.pageSize),
        onRowSelectionChange: setRowSelection,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: onPaginationChange,
        onColumnVisibilityChange: (data) => console.log(data),
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    return { table, isLoading: pending };
}
