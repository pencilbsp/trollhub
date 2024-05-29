"use client";

import slug from "slug";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import numeral from "@/lib/format-number";
import { ContentRank } from "@/types/other";
import { USER_CONTENTS_HOST } from "@/config";

import { Button } from "@/components/ui/Button";
import SpinerIcon from "@/components/icons/SpinerIcon";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Pagination,
  PaginationItem,
  PaginationContent,
} from "@/components/ui/pagination";

const step = 10;
const fallbackData = { data: [], total: 0 };

export default function Rankings() {
  const [range, setRange] = useState({ start: 0, end: step });

  const { data, isLoading } = useSWR<{
    total: number;
    data: ContentRank[];
  }>(
    `${USER_CONTENTS_HOST}/api/rankings?type=content&start=${range.start}&end=${range.end}`,
    async (url: string) => {
      try {
        const res = await fetch(url);
        const data = await res.json();
        return data as any;
      } catch (error) {
        return fallbackData;
      }
    },
    {
      fallbackData,
    }
  );

  const handleNext = () => {
    if (!isLoading && data?.total! > range.end) {
      setRange({ start: range.end, end: range.end + step });
    }
  };

  const handlePrev = () => {
    if (!isLoading && range.start >= step) {
      setRange({ start: range.start - step, end: range.start });
    }
  };

  return (
    <div>
      <div className="flex">
        <h2 className="font-bold uppercase text-2xl truncate">BXH Hôm Nay</h2>

        <Pagination className="ml-auto mr-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6"
                onClick={handlePrev}
                disabled={isLoading || range.start < step}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="sr-only">Previous Order</span>
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6"
                onClick={handleNext}
                disabled={isLoading || data?.total! <= range.end}
              >
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="sr-only">Next Order</span>
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <Card className="mt-4">
        <CardContent className="grid gap-4 py-4">
          {isLoading && (
            <div className="w-full flex justify-center items-center">
              <SpinerIcon />
            </div>
          )}

          {!isLoading && data?.data.length && (
            <p className="text-center">Không có dữ liệu.</p>
          )}

          {!isLoading &&
            data?.data.length &&
            data.data.map(({ id, type, thumbUrl, title, view }, index) => {
              const href = `/${type}/${slug(title)}-${id}`;

              return (
                <div key={id} className="pl-4">
                  <Link href={href} className="flex gap-3">
                    <div className="w-12 h-12 flex-shrink-0">
                      <Image
                        width={0}
                        height={0}
                        sizes="100vh"
                        alt={title}
                        src={thumbUrl}
                        className="w-full h-full border rounded object-cover"
                      />
                    </div>
                    <div
                      className={cn(
                        "flex justify-between items-center pb-1.5 w-full pr-3 space-x-2",
                        index !== data.data.length - 1 && "border-b"
                      )}
                    >
                      <p className="line-clamp-2 font-medium group-hover:text-blue-500 transition-colors">
                        {title}
                      </p>
                      <div className="ml-auto text-green-400 flex-shrink-0">
                        +{numeral(view || 0).format("0.0a")}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
        </CardContent>
      </Card>
    </div>
  );
}
