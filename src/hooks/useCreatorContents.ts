'use client';

import useSWR from 'swr';
import { useState, useTransition } from 'react';

import { getContents } from '@/actions/contentActions';

const fetcher = (_: String) => [];

export default function useCreatorContents(creatorId: string, take: number, defaultSkip = 0) {
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(defaultSkip >= take);
    const [pending, startTransition] = useTransition();
    const { data, mutate } = useSWR<any>(creatorId, fetcher, {
        fallbackData: [],
        revalidateOnMount: false,
        revalidateOnFocus: false,
    });

    const loadMore = () =>
        startTransition(async () => {
            const nextSkip = skip + defaultSkip;
            const result = await getContents({ creatorId }, { skip: nextSkip, take });

            const nextContents = [...data, ...result.contents];
            const isHasMore = result.total > defaultSkip + nextContents.length;
            setSkip(nextSkip);
            setHasMore(isHasMore);
            mutate(nextContents, { revalidate: false });
        });

    return {
        skip,
        hasMore,
        loadMore,
        contents: data,
        isLoading: pending,
    };
}
