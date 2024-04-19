"use client";

export default function FlyiconAd({ id }: { id: string }) {
  return (
    <div
      suppressHydrationWarning
      id={`atn-${id}`}
      style={{
        position: "fixed",
        right: "20px",
        top: "40%",
        zIndex: 9999,
      }}
      dangerouslySetInnerHTML={{
        __html: `<script async src="https://ajsc.yodimedia.com/code/d/6/${id}.js" crossorigin="anonymous"></script>`,
      }}
    />
  );
}
