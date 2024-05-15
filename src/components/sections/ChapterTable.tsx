"use client";

import slug from "slug";
import Link from "next/link";
import numeral from "numeral";
import { useEffect, useRef } from "react";
import { TabletSmartphoneIcon } from "lucide-react";

import { ContentType, Prisma } from "@prisma/client";
import { ChapterList } from "@/actions/contentActions";

import { cn, formatDate } from "@/lib/utils";

import useChapters from "@/hooks/useChapters";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/Table";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/Select";

interface Props {
  contentId: string;
  data?: ChapterList;
  currentId?: string;
  contentTitle: string;
  contentType: ContentType;
  createdAt?: Prisma.SortOrder;
  hiddenColumns?: ("view" | "update")[];
}

export default function ChapterTable({
  data,
  contentId,
  createdAt,
  currentId,
  contentType,
  contentTitle,
  hiddenColumns,
}: Props) {
  if (!createdAt) createdAt = "desc";
  if (!hiddenColumns) hiddenColumns = [];

  const { chapters, mutate } = useChapters(contentId, data);

  const handleSort = (value: Prisma.SortOrder) => {
    mutate(
      [
        // @ts-ignore
        ...chapters.sort((a: any, b: any) => {
          if (value === "desc") [a, b] = [b, a];
          return a.createdAt.getTime() - b.createdAt.getTime();
        }),
      ],
      { revalidate: false }
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xl uppercase">
          {contentType === "movie" ? "Danh sách tập" : "Danh sách chương"}
        </h3>
        <Select defaultValue={createdAt} onValueChange={handleSort}>
          <SelectTrigger className="w-28 h-8">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="desc">Mới nhất</SelectItem>
            <SelectItem value="asc">Cũ nhất</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card className="mt-4">
        <div className="max-h-80 overflow-y-auto">
          {/* @ts-ignore */}
          {chapters.length > 0 && (
            <Table>
              <TableHeader className="sticky top-0 dark:bg-gray-950 bg-gray-50 mx-4">
                <TableRow>
                  <TableHead>Tên</TableHead>
                  {!hiddenColumns.includes("update") && (
                    <TableHead className="text-right truncate">
                      Cập nhật
                    </TableHead>
                  )}
                  {!hiddenColumns.includes("view") && (
                    <TableHead className="text-right truncate">
                      Lượt xem
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* @ts-ignore */}
                {chapters.map(({ id, title, createdAt, mobileOnly, type, view }) => {
                  const isActive = id === currentId;
                  const slugTitle = `${contentTitle}-${title}`;
                  const href = `/${
                    type === ContentType.movie ? "episode" : "chapter"
                  }/${slug(slugTitle)}-${id}`;

                  return (
                    <ChapterRow
                      key={id}
                      view={view}
                      href={href}
                      title={title!}
                      isActive={isActive}
                      createdAt={createdAt}
                      mobileOnly={mobileOnly}
                      hiddenColumns={hiddenColumns}
                    />
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}

function scrollParentToChild(parent: HTMLElement, child: HTMLElement) {
  // Where is the parent on page
  const parentRect = parent.getBoundingClientRect();
  // What can you see?
  const parentViewableArea = {
    height: parent.clientHeight,
    width: parent.clientWidth,
  };

  // Where is the child
  const childRect = child.getBoundingClientRect();
  // Is the child viewable?
  const isViewable =
    childRect.top >= parentRect.top &&
    childRect.bottom <= parentRect.top + parentViewableArea.height;

  // if you can't see the child try to scroll parent
  if (!isViewable) {
    // Should we scroll using top or bottom? Find the smaller ABS adjustment
    const scrollTop = childRect.top - parentRect.top;
    const scrollBot = childRect.bottom - parentRect.bottom;
    if (Math.abs(scrollTop) < Math.abs(scrollBot)) {
      // we're near the top of the list
      parent.scrollTop += scrollTop;
    } else {
      // we're near the bottom of the list
      parent.scrollTop += scrollBot;
    }
  }
}

type ChapterRowProps = {
  href: string;
  view: number;
  title: string;
  isActive: boolean;
  mobileOnly: boolean;
  createdAt: Date;
  hiddenColumns?: ("view" | "update")[];
};

function ChapterRow({
  href,
  isActive,
  mobileOnly,
  title,
  view,
  hiddenColumns,
  createdAt,
}: ChapterRowProps) {
  const rowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (rowRef.current && isActive) {
      rowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [isActive]);

  return (
    <TableRow ref={rowRef}>
      <TableCell className="font-medium font-mono max-w-md">
        <Link
          href={href}
          className={cn(
            "flow-root max-w-full truncate",
            isActive && "text-blue-500"
          )}
        >
          {mobileOnly && (
            <TabletSmartphoneIcon
              size={16}
              className="mr-2 text-red-400 inline-block"
            />
          )}
          {title}
          {isActive && (
            <Badge
              variant="outline"
              className="ml-2 px-1.5 font-sans border-blue-500/70 bg-blue-500/90 text-background"
            >
              Đang xem
            </Badge>
          )}
        </Link>
      </TableCell>
      {!hiddenColumns!.includes("update") && (
        <TableCell className="text-right">
          <time className="font-mono font-light text-sm truncate">
            {formatDate(createdAt)}
          </time>
        </TableCell>
      )}
      {!hiddenColumns!.includes("update") && (
        <TableCell className="text-right">{numeral(view || 0).format("0a")}</TableCell>
      )}
    </TableRow>
  );
}
