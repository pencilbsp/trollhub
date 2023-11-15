import { Metadata } from "next";
import { notFound } from "next/navigation";

import { generateContentMetadata, getSlugId } from "@/lib/utils";

import getContent from "@/actions/getContent";
import ContentPage from "@/components/sections/ContentPage";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const contentId = getSlugId(params.slug);
  const data = await getContent(contentId);
  if (!data) return notFound();

  return generateContentMetadata(data);
}

export default async function ComicPage({ params }: Props) {
  const contentId = getSlugId(params.slug);
  const data = await getContent(contentId);
  if (!data) return notFound();

  return <ContentPage data={data} />;
}
