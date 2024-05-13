"use client";

export default function PTOAds({ id }: { id: string }) {
  return (
    <div
      suppressHydrationWarning
      id={`atn-${id}`}
      style={{ width: "100%" }}
      dangerouslySetInnerHTML={{
        __html: `<script async src="https://ajsc.yodimedia.com/code/6/7/${id}.js" crossorigin="anonymous"></script>`,
      }}
    />
  );
}
