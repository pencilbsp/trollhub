'use client';

import { useEffect } from 'react';

type Props = {
    gaId: string;
    dataAdSlot: string;
    dataAdFormat: string;
    dataFullwidthResponsive: boolean;
};

export default function AdBanner({ gaId, ...props }: Props) {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window.adsbygoogle || []).push({});
        }
    }, []);

    return (
        <ins
            data-ad-client={gaId}
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-slot={props.dataAdSlot}
            data-ad-format={props.dataAdFormat}
            data-full-width-responsive={props.dataFullwidthResponsive}
        ></ins>
    );
}
