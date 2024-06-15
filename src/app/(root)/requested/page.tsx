import { Metadata } from "next";
import { getServerSession } from "next-auth";

import authOptions from "@/lib/auth";
// components
import RequestedChapterPage from "@/components/sections/RequestedChapterPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Nội dung đã yêu cầu",
    description: "Xem lại các yêu cầu và trạng thái cập nhật",
  };
}

export default async function RequestedPage() {
  const session = await getServerSession(authOptions);

  return <RequestedChapterPage session={session} />;
}
