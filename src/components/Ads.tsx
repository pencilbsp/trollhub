"use client";

import { ADS_ID } from "@/config";

export default function Ads() {
  return (
    <div
      suppressHydrationWarning
      id={ADS_ID}
      style={{
        position: "fixed",
        right: "20px",
        top: "40%",
        zIndex: 9999,
      }}
      dangerouslySetInnerHTML={{
        __html: `<script async src="https://ajsc.yodimedia.com/code/d/6/d67d8ab4f4c10bf22aa353e27879133c.js" crossorigin="anonymous"></script>`,
      }}
    />
  );
}
