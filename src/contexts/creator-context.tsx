'use client';

import { Creator } from '@prisma/client';
import { createContext, ReactNode, useEffect, useState, useTransition } from 'react';

import useLocalStorage from '@/hooks/use-local-storage';
import { getCreatorByIds } from '@/actions/guest/creator-action';
import { toast } from 'sonner';

const defaultState: {
    ids: string[];
    activeId?: string;
    isLoading: boolean;
    creators: Creator[];
} = {
    ids: [],
    creators: [],
    isLoading: true,
};

const initialState = { ...defaultState };
const CACHE_KEY = 'ADMIN_SELECTED_CREATORS';

export const CreatorContext = createContext(initialState);

export default function CreatorProvider({ children }: { children: ReactNode }) {
    const [isLoading, startTransition] = useTransition();
    const [creators, setCreators] = useState(initialState.creators);
    const [ids, setIds] = useLocalStorage(CACHE_KEY, initialState.ids);

    const fetcher = (ids: string[]) =>
        startTransition(async () => {
            if (ids.length === 0) return;

            try {
                const result = await getCreatorByIds(ids);
                if (result) setCreators(result);
            } catch (error: any) {
                toast.error(error.message);
            }
        });

    useEffect(() => fetcher(ids), [ids]);

    return <CreatorContext.Provider value={{ ...initialState, creators, ids, isLoading }}>{children}</CreatorContext.Provider>;
}
