"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";

import { getRequestedChapters } from "@/actions/chapterActions";

const step = 12;

type Props = {
  sort: string;
  end?: number;
  start?: number;
  type: "all" | "own";
};

const fallbackData = {
  data: { total: 0, requests: [] },
};

export default function useRequestedChapters({ start = 0, end = 12, type, sort }: Props) {
  const [range, setRange] = useState({ start, end });

  const swrKey = useMemo(
    () => new URLSearchParams({ start: range.start.toString(), end: range.end.toString(), type, sort }),
    [range, type, sort]
  );

  const { data, isLoading } = useSWR(swrKey.toString(), getRequestedChapters, { fallbackData });

  

  const handleNext = () => {
    // @ts-ignore
    if (!isLoading && data.data.total > range.end) {
      setRange({ start: range.end, end: range.end + step });
    }
  };

  const handlePrev = () => {
    if (!isLoading && range.start >= step) {
      setRange({ start: range.start - step, end: range.start });
    }
  };

  return {
    ...range,
    isLoading,
    handleNext,
    handlePrev,
    ...(data.data || fallbackData.data),
    prevDisabled: isLoading || range.start < step,
    // @ts-ignore
    nextDisabled: isLoading || data.data.total <= range.end,
  };
}
