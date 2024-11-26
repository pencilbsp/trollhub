import useSWR from 'swr';
import { Prisma } from '@prisma/client';
import { ChangeEvent, useMemo, useState } from 'react';

import { getChapters } from '@/actions/chapterActions';

export type ChapterResult = NonNullable<Awaited<ReturnType<typeof getChapters>>>;

const fetcher = async (id: string) => {
    const contentId = id.split('|')[0];
    return getChapters({ contentId, hidden: false }, { orderBy: { createdAt: 'desc' } });
};

export default function useChapters(contentId: string, fallbackData: ChapterResult = { total: 0, data: [] }) {
    const swrKey = `${contentId}|chapters`;
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<Prisma.SortOrder>('desc');
    const { data, error, isLoading, mutate } = useSWR<ChapterResult>(swrKey, fetcher, { fallbackData, revalidateOnFocus: false });

    const onFilter = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.currentTarget.value) {
            setSearch(event.currentTarget.value);
        } else {
            setSearch('');
        }
    };

    const filtered = useMemo(() => {
        if (!data) return [];

        const chapters = data.data.sort((a, b) => {
            if (sort === 'desc') [a, b] = [b, a];
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

        if (!search) return chapters;
        return chapters.filter(({ title }) => title && title.indexOf(search) > -1);
    }, [search, data, sort]);

    return {
        mutate,
        setSort,
        onFilter,
        isLoading,
        isError: error,
        chapters: filtered,
        total: data?.total || 0,
    };
}
