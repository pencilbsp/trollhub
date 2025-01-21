'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getContents } from '@/actions/admin/content';

const useContents = (contentId: string) => {
    const [skip, setSkip] = useState(0);
    const [take, setTake] = useState(10);
    const [search, setSearch] = useState('');

    const nextPage = () => {};

    const previousPage = () => {};

    const { data } = useQuery({
        queryKey: [contentId],
        queryFn: async () => {
            const result = await getContents({ select: { id: true, categories: true } });
        },
    });
};
