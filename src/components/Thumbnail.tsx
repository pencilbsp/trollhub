import Image from 'next/image';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { EyeOffIcon } from 'lucide-react';
import useSettings from '@/hooks/use-settings';

type SupportRatio = '16/9' | '1/1' | 'auto';

interface Props {
    alt: string;
    thumbUrl: string;
    className?: string;
    adultContent?: boolean;
    children?: React.ReactNode;
    ratio?: SupportRatio | string;
}

function getAspectRatio(ratio?: SupportRatio | string) {
    if (!ratio) return '';
    switch (ratio) {
        case '1/1':
            return 'aspect-square';
        case 'auto':
            return 'aspect-auto';
        case '3/4':
            return 'aspect-3/4';
        case '4/3':
            return 'aspect-4/3';
        case '9/16':
            return 'aspect-9/16';
        case '16/9':
            return 'aspect-video';
        default:
            return `aspect-[${ratio}]`;
    }
}

export default function Thumbnail({ thumbUrl, alt, className, ratio, adultContent, children }: Props) {
    const { showAdultContent } = useSettings();
    const isShow = adultContent && !showAdultContent;

    let thumbHdUrl = thumbUrl;
    if (thumbUrl.endsWith('_256x')) thumbHdUrl = thumbHdUrl.replace('_256x', '_720x');

    const [obClassName, filteredClassName] = React.useMemo(() => {
        const obClass = className?.match(/(?:dark:object-|object-)\S+/g) || [];
        const filteredClasses = className?.replace(/(?:dark:object-|object-)\S+/g, '').trim();
        return [obClass, filteredClasses];
    }, [className]);

    return (
        <div className={cn(['relative z-10 mt-6 w-full', getAspectRatio(ratio), filteredClassName])}>
            <div
                className={cn('absolute inset-0 blur-lg')}
                style={{
                    background: `url(${thumbUrl}) center center / cover scroll no-repeat`,
                }}
            />
            <Image
                unoptimized
                alt={alt}
                width={0}
                height={0}
                loading="lazy"
                src={thumbHdUrl}
                className={cn('relative h-full w-full object-contain', obClassName, isShow && 'blur-md')}
            />
            {isShow && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 font-light text-muted">
                    <EyeOffIcon className="h-4 w-4 cursor-pointer" />
                    <span className="mt-2 text-center text-xs">
                        Hình ảnh chứa
                        <br />
                        nội dung nhạy cảm
                    </span>
                </div>
            )}
            {children && <div className="absolute right-5 top-0 flex flex-col items-end">{children}</div>}
        </div>
    );
}
