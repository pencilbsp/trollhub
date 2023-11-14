import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { getUserHistories } from "@/actions/historyActions";
import HistoryPage from "@/components/sections/HistoryPage";

export default async function History() {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) return redirect("/login?next=/history");

  const histories = await getUserHistories();
  return <HistoryPage data={histories} />;
}
