import useSWR from "swr";
import { useTransition } from "react";
import { Prisma } from "@prisma/client";

import { ArrayElement } from "@/types/utils";
import { getComments } from "@/actions/commentActions";

type FallbackData = Awaited<ReturnType<typeof getComments>>;
export type Comment = ArrayElement<FallbackData["list"]>;

const fallbackData: FallbackData = {
  list: [],
  total: 0,
  isMore: false,
  options: {
    take: 6,
    skip: 0,
    sort: "desc",
  },
};

const fetcher = (id: string) => getComments(id);

export default function useComment(contentId: string) {
  const [isPending, startTransition] = useTransition();
  const { data, isLoading, error, mutate } = useSWR(contentId, fetcher, { fallbackData });

  const addComment = async (comment: Comment) => {
    const list = [comment, ...data.list];
    mutate({ ...data, list: list }, { revalidate: false });
  };

  const likeComment = async (id: string, liked: boolean) => {
    const list = [...data.list];
    const index = list.findIndex((c) => c.id === id);

    if (index > -1) {
      const c = list[index];
      const totalLike = liked ? c.totalLike + 1 : c.totalLike - 1;
      list[index] = { ...c, liked, totalLike };
      mutate({ ...data, list }, { revalidate: false });
    }
  };

  const deleteComment = async (id: string) => {
    const list = [...data.list];
    const index = list.findIndex((c) => c.id === id);

    if (index > -1) {
      list.splice(index, 1);
      mutate({ ...data, list }, { revalidate: false });
    }
  };

  const sortComment = async (sort: Prisma.SortOrder) => {
    const sorted = await getComments(contentId, { sort });
    mutate(sorted, { revalidate: false });
  };

  const loadMoreComment = () =>
    startTransition(async () => {
      if (!isPending) {
        const more = await getComments(contentId, { ...data.options, skip: data.list.length });
        mutate({ ...data, list: [...data.list, ...more.list], isMore: more.isMore }, { revalidate: false });
      }
    });

  return {
    mutate,
    comment: data,
    isError: error,
    isLoading: isLoading || isPending,
    addComment,
    likeComment,
    sortComment,
    deleteComment,
    loadMoreComment,
  };
}
