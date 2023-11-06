import { notFound } from "next/navigation";

import getContent from "@/actions/getContent";
import ContentPage from "@/components/sections/ContentPage";

interface Props {
  params: { slug: string };
}

export default async function ComicPage({ params }: Props) {
  const contentId = params.slug.slice(-24);
  const data = await getContent(contentId);
  if (!data) return notFound();

  // @ts-ignore
  return <ContentPage data={data} />;
}
