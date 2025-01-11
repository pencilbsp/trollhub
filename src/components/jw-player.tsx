import { useEffect, useRef } from 'react';

import { PlayerError, PlayerSource } from '@/types/other';
import _JWPlayer, { JWPlayerProps } from '@jwplayer/jwplayer-react';

interface Props extends Omit<JWPlayerProps, 'library' | 'file' | 'onTime'> {
    currentTime: number;
    thumbnails?: string;
    source?: PlayerSource | null;
    onTime?: (time: number) => void;
    onError?: (error: PlayerError | null) => void;
}

const JWPlayer = function ({ source, onTime, onError, thumbnails, currentTime, ...props }: Props) {
    const player = useRef<jwplayer.JWPlayer | null>(null);

    useEffect(() => {
        if (player.current && source) {
            player.current.load(source.src);
            player.current.play();
        }
    }, [source]);

    return (
        <_JWPlayer
            {...props}
            file={source?.src}
            didMountCallback={(e) => {
                player.current = e.player;
                props.didMountCallback?.(e);
            }}
            onError={(error) => {
                if (typeof onError === 'function') {
                    onError({ message: error.message });
                }
            }}
            onTime={(e) => {
                if (typeof onTime === 'function') {
                    onTime(e.position);
                }
            }}
            onReady={() => {
                if (player.current && currentTime > 0) {
                    player.current?.seek(currentTime);
                }
            }}
            library="/js/jwplayer/library/8.21.2.js"
        />
    );
};

JWPlayer.displayName = 'JWPlayer';

export default JWPlayer;
