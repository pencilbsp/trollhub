import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import HistoryPage from "@/components/sections/HistoryPage"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function History() {
  const session = await getServerSession(authOptions)
  if (!session?.user.id) return redirect("/login?next=/history")

  return <HistoryPage />
}
