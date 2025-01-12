'use clinet';

import { useEffect } from 'react';

type Callback = (event: KeyboardEvent) => void;
type KeyName = 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey';
type Options = {
    [key in KeyName]?: boolean;
};

export default function useKeyPress(keyName: string, callback: Callback, options?: Options) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const code = event.which || event.keyCode;
            const charCode = String.fromCharCode(code).toLowerCase();

            let toggle = false;
            if (options)
                Object.keys(options).forEach((key) => {
                    toggle = event[key as KeyName] === options[key as KeyName] && charCode === keyName;
                });
            else toggle = charCode === keyName;
            toggle && callback(event);
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [keyName, callback, options]);
}
