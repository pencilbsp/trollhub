"use client";

import slug from "slug";
import Link from "next/link";

import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { TabletSmartphoneIcon } from "lucide-react";

import { ChapterList } from "@/actions/getContent";
import { ContentType, Prisma } from "@prisma/client";

import useChapters from "@/hooks/useChapters";

import { Card } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

interface Props {
  contentId: string;
  data?: ChapterList;
  contentTitle: string;
  contentType: ContentType;
  createdAt?: Prisma.SortOrder;
  hiddenColumns?: ("view" | "update")[];
}

export default function ChapterTable({ data, contentId, createdAt, contentType, contentTitle, hiddenColumns }: Props) {
  if (!createdAt) createdAt = "desc";
  if (!hiddenColumns) hiddenColumns = [];

  const { chapters, mutate } = useChapters(contentId, data);

  const handleSort = (value: Prisma.SortOrder) => {
    mutate(
      [
        ...chapters.sort((a, b) => {
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
          {chapters.length > 0 && (
            <Table>
              <TableHeader className="sticky top-0 dark:bg-gray-950 bg-gray-50 mx-4">
                <TableRow>
                  <TableHead>Tên</TableHead>
                  {!hiddenColumns.includes("update") && (
                    <TableHead className="text-right hidden sm:table-cell">Cập nhật</TableHead>
                  )}
                  {!hiddenColumns.includes("view") && (
                    <TableHead className="text-right hidden sm:table-cell">Lượt xem</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {chapters.map(({ id, title, createdAt, mobileOnly, type }) => {
                  const href = `/${type === ContentType.movie ? "episode" : "chapter"}/${slug(contentTitle)}-${id}`;

                  return (
                    <TableRow key={id}>
                      <TableCell className="font-medium font-mono max-w-md">
                        <Link href={href} className="flow-root max-w-full truncate">
                          {mobileOnly && <TabletSmartphoneIcon size={16} className="mr-2 text-red-400 inline-block" />}
                          {title}
                        </Link>
                      </TableCell>
                      {!hiddenColumns!.includes("update") && (
                        <TableCell className="text-right hidden sm:table-cell">
                          <time className="font-mono font-light text-sm">
                            {format(createdAt, "dd/MM/yyyy HH:mm", { locale: vi })}
                          </time>
                        </TableCell>
                      )}
                      {!hiddenColumns!.includes("update") && (
                        <TableCell className="text-right hidden sm:table-cell">100K</TableCell>
                      )}
                    </TableRow>
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
