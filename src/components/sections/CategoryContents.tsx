"use client";

import { useInView } from "react-intersection-observer";
import { useEffect, useState, useTransition } from "react";

import SpinerIcon from "../icons/SpinerIcon";
import { getContentsByCategoryId } from "@/actions/getContents";
import ContentCard, { ContentWithCreator } from "../ContentCard";

interface Props {
  id: string;
  contents: ContentWithCreator[];
}

interface LoadMoreContentProps {
  id: string;
}

function LoadMoreContent({ id }: LoadMoreContentProps) {
  const { ref, inView } = useInView();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [contents, setContents] = useState<ContentWithCreator[]>([]);
  const [isPending, startTransition] = useTransition();

  const loadContents = async () => {
    const category: any = await getContentsByCategoryId(id, { take: 12, skip: 12 * page });
    if (category && category.contents.length > 0) {
      setPage(page + 1);
      setContents((prevContents) => [...prevContents, ...category.contents]);
    } else {
      setHasMore(false);
    }
  };

  useEffect(() => {
    if (inView && hasMore && !isPending) {
      startTransition(() => loadContents());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <>
      {contents &&
        contents.map((content) => {
          // @ts-ignore
          return <ContentCard key={content.id} direction="horizontal" data={content} />;
        })}
      <div ref={ref} className="">
        <div className="flex items-center justify-center text-blue-600">
          <SpinerIcon />
          <span className="ml-2 text-lg">Đang tải thêm...</span>
        </div>
      </div>
    </>
  );
}

export default function CategoryContents({ contents, id }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {contents &&
        contents.map((content) => (
          // @ts-ignore
          <ContentCard key={content.id} direction="horizontal" data={content} />
        ))}
      <LoadMoreContent id={id} />
    </div>
  );
}
