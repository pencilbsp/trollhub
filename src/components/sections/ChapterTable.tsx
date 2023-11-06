"use client";

import slug from "slug";
import Link from "next/link";
import { useEffect, useState } from "react";

import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { INIT_CHAPTER } from "@/config";
import getChapters from "@/actions/getChapters";

import { TabletSmartphoneIcon } from "lucide-react";
import { Chapter, ContentType } from "@prisma/client";

import { Card } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

interface Props {
  data?: Chapter[];
  contentId: string;
  contentTitle: string;
  contentType: ContentType;
  createdAt?: "desc" | "asc";
}

export default function ChapterTable({ data, contentId, contentTitle, contentType, createdAt }: Props) {
  if (!createdAt) createdAt = "desc";
  const [chapters, setChapters] = useState(data || []);

  const handleSort = async (value: string) => {
    const sorted = chapters.sort((a, b) => {
      if (value === "desc") [a, b] = [b, a];
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
    setChapters([...sorted]);
  };

  const fetchChapterList = async () => {
    const data = await getChapters(contentId, { skip: INIT_CHAPTER, orderBy: { createdAt } });
    setChapters([...chapters, ...data]);
  };

  useEffect(() => {
    fetchChapterList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                  <TableHead className="text-right hidden sm:table-cell">Cập nhật</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Lượt xem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chapters.map(({ id, title, createdAt, mobileOnly, type }) => {
                  const href = `/${type === ContentType.movie ? "episode" : "chapter"}/${slug(contentTitle)}-${id}`;

                  return (
                    <TableRow key={id}>
                      <TableCell className="font-medium font-mono">
                        <Link href={href} className="flex">
                          {mobileOnly && <TabletSmartphoneIcon size={16} className="mr-2 text-red-400" />}
                          {title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell">
                        <time className="font-mono font-light text-sm">
                          {format(createdAt, "dd/MM/yyyy HH:mm", { locale: vi })}
                        </time>
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell">100K</TableCell>
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
