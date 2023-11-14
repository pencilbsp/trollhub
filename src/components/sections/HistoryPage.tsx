"use client";

import slug from "slug";
import Link from "next/link";
import { format } from "date-fns";

import { Trash2Icon } from "lucide-react";

import { History } from "@/actions/historyActions";

import Thumbnail from "../Thumbnail";
import { Button } from "../ui/Button";
import useHistory from "@/hooks/useHistory";

interface Props {
  data: History[];
}

export default function HistoryPage({ data }: Props) {
  const { histories, removeHistory } = useHistory(data);

  return (
    <div className="container p-2 sm:px-8 xl:max-w-7xl">
      <div className="grid grid-cols-3 gap-6 w-full p-2">
        <div className="flex flex-col gap-4 col-span-3 md:col-span-2">
          <h1 className="font-bold text-2xl uppercase text-blue-500">Nhật ký xem</h1>
          {/* <p className="font-bold">Hôm nay</p> */}

          <div className="flex flex-col gap-y-4">
            {histories.map(({ content, id, chapter, updatedAt }) => (
              <div key={id} className="flex">
                <Thumbnail
                  ratio="16/9"
                  alt={content.title}
                  thumbUrl={content.thumbUrl!}
                  className="max-w-[180px] lg:max-w-[220px] rounded-xl border mt-0 overflow-hidden"
                />
                <div className="flex flex-col ml-3 w-full">
                  <time className="text-sm text-muted-foreground">{format(updatedAt, "dd/MM/yyyy HH:mm")}</time>
                  <Link href={`/${content.type}/${slug(content.title)}-${content.id}`}>
                    <h3 className="font-semibold lg:text-lg line-clamp-1 lg:line-clamp-2">{content.title}</h3>
                  </Link>
                  <p className="font-semibold line-clamp-1">{chapter.title}</p>
                  <div className="flex gap-x-3 justify-end w-full mt-auto">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/chapter/${slug(content.title)}-${chapter.id}`}>Tiếp tục</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeHistory(id)}
                      className="text-red-500 hover:text-red-500"
                    >
                      <Trash2Icon size={20} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-3 md:col-span-1"></div>
      </div>
    </div>
  );
}
