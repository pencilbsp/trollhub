import { chaptersMapTable } from "@/lib/utils"
import DataTable from "@/components/data-table"
import { chaptersFetcher } from "@/lib/fetcher"
import { columns } from "@/app/(root)/data/columns"
import { getChapters } from "@/actions/chapterActions"

export default async function DataPage() {
  const data = await getChapters(
    {},
    {
      select: {
        id: true,
        fid: true,
        title: true,
        type: true,
        status: true,
        mobileOnly: true,
        content: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
      skip: 0,
      take: 10,
    }
  )

  data.data = chaptersMapTable(data.data)

  return (
    <div className="container p-2 sm:px-8 xl:max-w-7xl mt-3">
      {/* @ts-ignore */}
      <DataTable data={data} columns={columns} fetcher={chaptersFetcher} fetcherKey="dataTable" />
    </div>
  )
}
