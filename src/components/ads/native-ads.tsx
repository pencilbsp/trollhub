'use client';

export default function NativeAds({ id }: { id: string }) {
    return (
        <div
            suppressHydrationWarning
            id={`atn-${id}`}
            className="sm:px-2 w-full"
            dangerouslySetInnerHTML={{
                __html: `<script async src="https://ajsc.yodimedia.com/code/6/4/${id}.js" crossorigin="anonymous"></script>`,
            }}
        />
    );
}
