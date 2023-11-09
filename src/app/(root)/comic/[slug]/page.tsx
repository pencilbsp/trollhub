import { Metadata } from "next";
import { notFound } from "next/navigation";

import getContent from "@/actions/getContent";
import ContentPage from "@/components/sections/ContentPage";
import { generateKeywords } from "@/lib/utils";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const contentId = params.slug.slice(-24);
  const data = await getContent(contentId);
  if (!data) return notFound();

  return {
    title: data.title + " - " + data.creator.name,
    description: data.description?.slice(0, 255),
    keywords: generateKeywords(data.title, data.akaTitle, data.creator.name, data.type),
    openGraph: {
      type: data.type === "movie" ? "video.movie" : "website",
      title: data.title,
      siteName: "fuhuzz.rip",
      locale: "vi_VN",
      description: data.description?.slice(0, 255),
      images: {
        url: data.thumbUrl!,
      },
    },
  };
}

export default async function ComicPage({ params }: Props) {
  const contentId = params.slug.slice(-24);
  const data = await getContent(contentId);
  if (!data) return notFound();

  // @ts-ignore
  return <ContentPage data={data} />;
}
