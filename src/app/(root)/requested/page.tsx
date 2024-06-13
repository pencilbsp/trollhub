import { getServerSession } from "next-auth";

import authOptions from "@/lib/auth";
// components
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export default async function RequestedPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="container p-2 sm:px-8 xl:max-w-7xl">
      <Tabs defaultValue={session ? "own" : "all"}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="own" disabled={!session}>Của tôi</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
}
