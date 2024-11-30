'use client';

import useSWR from 'swr';
import { useEffect, useRef, useTransition } from 'react';
import { History, HistoryData, deleteHistory, getUserHistories } from '@/actions/historyActions';

const fetcher = (_: string) => getUserHistories();

const groupByDate = (data: History[]) => {
    const grouped: Map<string, History[]> = new Map();

    data.forEach((item) => {
        // Lấy ngày của sự kiện
        const key = item.updatedAt.toISOString().split('T')[0]; // Lấy phần ngày từ đối tượng Date

        // Kiểm tra xem đã có nhóm cho ngày này chưa, nếu chưa thì tạo mới
        if (!grouped.has(key)) {
            grouped.set(key, []);
        }

        // Thêm sự kiện vào nhóm của ngày tương ứng
        grouped.get(key)?.push(item);
    });

    return grouped;
};

const initialFallbackData: HistoryData = {
    total: 0,
    loaded: false,
    histories: [],
};

export default function useHistory(fallbackData: HistoryData = initialFallbackData) {
    const query = useRef({ skip: 0, take: 12 });
    const [isPending, startTransition] = useTransition();
    const { data, isLoading, error, mutate } = useSWR('history', fetcher, {
        fallbackData,
        // revalidateOnMount: false,
        revalidateOnFocus: false,
    });

    const removeHistory = (id: string) => {
        const histories = [...data.histories];
        const index = histories.findIndex((c) => c.id === id);

        if (index > -1) {
            histories.splice(index, 1);
            const total = data.total - 1;
            // @ts-ignore
            mutate({ ...data, total, histories }, { revalidate: false });

            if (!isPending) {
                startTransition(async () => {
                    await deleteHistory(id);
                });
            }
        }
    };

    const upadteHistory = (history: History) => {
        let histories = [...data.histories];
        const index = histories.findIndex((c) => c.id === history.id);

        const total = data.total + 1;

        if (index > -1) {
            histories[index] = history;
            histories = histories.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
            // @ts-ignore
            mutate({ ...data, total, histories }, { revalidate: false });
        } else {
            mutate(
                // @ts-ignore
                { ...data, total, histories: [history, ...data.histories] },
                { revalidate: false },
            );
        }
    };

    const loadMoreHistory = () => {
        if (!isLoading && !isPending) {
            startTransition(async () => {
                const options = query.current;
                query.current = { ...options, skip: data.histories.length };
                const history = await getUserHistories(query.current);
                mutate(
                    {
                        ...data,
                        // @ts-ignore
                        histories: [...data.histories, ...history.histories],
                        total: history.total,
                    },
                    { revalidate: false },
                );
            });
        }
    };

    useEffect(() => {
        if (!data.loaded && fallbackData.loaded) {
            // const total = data.total + fallbackData.total;
            // const histories = [...data.histories, ...fallbackData.histories];
            // mutate({ ...fallbackData, total, histories }, { revalidate: false });
            mutate(fallbackData, { revalidate: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        removeHistory,
        upadteHistory,
        isError: error,
        loadMoreHistory,
        total: data.total,
        isLoading: isLoading || isPending,
        histories: groupByDate(data.histories),
        hasMore: data.total > data.histories.length,
    };
}
