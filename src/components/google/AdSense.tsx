import Script from 'next/script';

type Props = {
    pId: string;
};

export default function AdSense({ pId }: Props) {
    return <Script async crossOrigin="anonymous" strategy="afterInteractive" src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pId}`} />;
}
