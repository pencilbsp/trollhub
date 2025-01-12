'use client';

import useSWR from 'swr';
import { Creator } from '@prisma/client';
import { createContext, ReactNode, useTransition } from 'react';

import useLocalStorage from '@/hooks/use-local-storage';
import { getCreatorByIds } from '@/actions/guest/creator-action';

const defaultState: {
    ids: string[];
    activeId?: string;
    creators: Map<string, Creator>;
} = {
    ids: [],
    creators: new Map(),
};

const initialState = { ...defaultState };
const CACHE_KEY = 'ADMIN_SELECTED_CREATORS';

export const CreatorContext = createContext(initialState);

export default function CreatorProvider({ children }: { children: ReactNode }) {
    const [ids, setIds] = useLocalStorage(CACHE_KEY, initialState.ids);

    const { data, isLoading } = useSWR(CACHE_KEY, () => getCreatorByIds(ids));

    return <CreatorContext.Provider value={{ isLoading }}>{children}</CreatorContext.Provider>;
}
