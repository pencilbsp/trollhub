'use client';
import 'react-lazy-load-image-component/src/effects/blur.css';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import 'react-lazy-load-image-component/src/effects/black-and-white.css';

import { useRef, useState } from 'react';
import { LazyLoadImage, LazyLoadImageProps } from 'react-lazy-load-image-component';

import { cn } from '@/lib/utils';
import ImagePlaceholder from './image-placeholder';

// ----------------------------------------------------------------------

type ImageRatio = '4/3' | '3/4' | '6/4' | '4/6' | '16/9' | '9/16' | '21/9' | '9/21' | '1/1';
interface Props extends LazyLoadImageProps {
    ratio?: ImageRatio;
    className?: string;
    tmpRatio?: ImageRatio;
    disabledEffect?: boolean;
}

export default function Image({ ratio, tmpRatio, className, effect = 'blur', disabledEffect = false, ...other }: Props) {
    const [loading, setLoading] = useState(true);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const onLoad = () => {
        setLoading(false);
        if (wrapperRef.current && tmpRatio) {
            wrapperRef.current.style.paddingTop = '0px';
            const lazy = wrapperRef.current.querySelector('span.lazy-wrapper');
            if (lazy) (lazy as HTMLSpanElement).style.position = 'relative';
        }
    };

    const aspectRatio = ratio || tmpRatio;

    return (
        <div ref={wrapperRef} style={aspectRatio && { paddingTop: getRatio(aspectRatio) }} className={cn('w-full h-full relative p-0', className)}>
            {loading && <ImagePlaceholder />}
            <LazyLoadImage onLoad={onLoad} wrapperClassName="lazy-wrapper" effect={disabledEffect ? undefined : effect} placeholder={<ImagePlaceholder />} {...other} />
        </div>
    );
}

// ----------------------------------------------------------------------

function getRatio(ratio = '1/1') {
    return {
        '4/3': 'calc(100% / 4 * 3)',
        '3/4': 'calc(100% / 3 * 4)',
        '6/4': 'calc(100% / 6 * 4)',
        '4/6': 'calc(100% / 4 * 6)',
        '16/9': 'calc(100% / 16 * 9)',
        '9/16': 'calc(100% / 9 * 16)',
        '21/9': 'calc(100% / 21 * 9)',
        '9/21': 'calc(100% / 9 * 21)',
        '1/1': '100%',
    }[ratio];
}
