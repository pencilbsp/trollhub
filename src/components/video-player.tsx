'use client';

import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { ReactNode, useEffect, useRef, useState } from 'react';

import { RocketIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import useHistory from '@/hooks/useHistory';
import useSettings from '@/hooks/useSettings';
import VidstackPlayer from './vidstack-player';
import { createHistory } from '@/actions/guest/history-actions';
import { PlayerError, PlayerInterface, PlayerSource } from '@/types/other';

import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const JWPlayer = dynamic(() => import('@/components/jwplayer'), {
    loading: () => <PlayerLoading />,
});

type Props = {
    vid: string;
    contentId: string;
    thumbnails?: string;
    defaultSource: string;
    sources: PlayerSource[];
    playerInterface?: PlayerInterface;
};

const findSource = (sources: PlayerSource[], key: string) => {
    return sources.find((e) => e.key === key) || sources[0];
};

/* -------------------------------------------------------------------------------------------------
 * Video Player
 * -----------------------------------------------------------------------------------------------*/

export default function VideoPlayer({ vid, sources, contentId, thumbnails, defaultSource }: Props) {
    const { data } = useSession();
    const { upadteHistory } = useHistory();
    const { playerInterface } = useSettings();

    const time = useRef(0);

    const [error, setError] = useState<PlayerError | null>(null);
    const [source, setSource] = useState<PlayerSource>(findSource(sources, defaultSource));

    const onClick = () => {
        setError(null);
    };

    useEffect(() => {
        const handleHistory = async () => {
            const { error, history } = await createHistory(contentId, vid);
            if (error) return toast.error(error.message);
            // @ts-ignore
            upadteHistory(history);
        };

        data?.user.id && handleHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contentId, vid, data?.user.id]);

    return (
        <div className="space-y-4">
            <VideoPlayerError onClick={onClick} buttonText="Thử lại" message={error?.message} />

            {!error && playerInterface === 'vidstack' && <VidstackPlayer source={source} onError={setError} currentTime={time.current} onTime={(t) => (time.current = t)} />}

            {!error && playerInterface === 'jwplayer' && <JWPlayer config={{}} source={source} onError={setError} currentTime={time.current} onTime={(t) => (time.current = t)} />}

            {sources.length > 0 && (
                <div className="px-4 sm:px-0 flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
                    <div className="font-medium md:text-lg flex items-center gap-1.5">
                        <RocketIcon className="h-4 md:h-5" />
                        <span>Chọn nguồn phát</span>
                    </div>
                    <Tabs
                        value={source.key}
                        onValueChange={(newValue) => {
                            setError(null);
                            // console.log(findSource(sources, newValue));
                            setSource(findSource(sources, newValue));
                        }}
                    >
                        <TabsList className="grid grid-cols-2 h-8 p-0 px-1 py-1 sm:flex">
                            {sources.map((source) => {
                                return (
                                    <TabsTrigger key={source.key} value={source.key} className="h-[1.45rem] rounded-sm px-2 text-xs">
                                        {source.label}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </Tabs>
                </div>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------------------------------
 * Video Player Components
 * -----------------------------------------------------------------------------------------------*/

function PlayerBox({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('w-full flex flex-col items-center justify-center aspect-video border border-dashed p-4', className)}>{children}</div>;
}

export function PlayerLoading({ className }: { className?: string }) {
    return <PlayerBox className={className}>Đang tải...</PlayerBox>;
}

type VideoPlayerErrorProps = {
    message?: string;
    className?: string;
    buttonText?: string;
    children?: ReactNode;
    buttonIcon?: ReactNode;
    onClick?: VoidFunction;
};

export function VideoPlayerError({ message, buttonText, buttonIcon, onClick, children, className }: VideoPlayerErrorProps) {
    return (
        <div>
            {message && (
                <PlayerBox className={className}>
                    <p className="mb-3 text-base md:text-lg text-center">{message}</p>
                    {children ? (
                        children
                    ) : buttonText ? (
                        <Button className="items-center" onClick={onClick}>
                            {buttonText}
                            {buttonIcon}
                        </Button>
                    ) : null}
                </PlayerBox>
            )}
        </div>
    );
}
