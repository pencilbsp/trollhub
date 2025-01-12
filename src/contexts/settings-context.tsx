'use client';

import { ReactNode, createContext, useState } from 'react';

import { PlayerInterface } from '@/types/other';
import useLocalStorage from '@/hooks/use-local-storage';

const defaultSettings: {
    open: boolean;
    showAdultContent: boolean;
    playerInterface: PlayerInterface;
} = {
    open: false,
    showAdultContent: false,
    playerInterface: 'jwplayer',
};

const initialState = {
    ...defaultSettings,
    toggleOpenSetting: () => {},
    changePlayerInterface: () => {},
    toggleShowAdultContent: () => {},
};

export const SettingsContext = createContext(initialState);

export default function SettingsProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const [settings, setSettings] = useLocalStorage('ROOT_SETTINGS', {
        playerInterface: initialState.playerInterface,
        showAdultContent: initialState.showAdultContent,
    });

    const toggleShowAdultContent = (show: boolean) => {
        setSettings({
            ...settings,
            showAdultContent: show,
        });
    };

    const changePlayerInterface = (playerInterface: PlayerInterface) => {
        setSettings({
            ...settings,
            playerInterface,
        });
    };

    const toggleOpenSetting = () => setOpen(!open);

    return (
        <SettingsContext.Provider
            value={{
                ...settings,
                open,
                toggleOpenSetting,
                changePlayerInterface,
                toggleShowAdultContent,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}
