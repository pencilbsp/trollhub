"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/Badge"
import { Checkbox } from "@/components/ui/checkbox"

import { formatToNow } from "@/lib/utils"
import { labels, priorities, statuses } from "@/components/data-table/data"
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"

export const columns: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tên" />,
    cell: ({ row }) => {
      const label = labels.find((label) => label.value === row.original.label)

      return (
        <Link href={row.original.url} className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <span className="max-w-[500px] truncate font-medium">{row.getValue("title")}</span>
        </Link>
      )
    },
  },
  {
    accessorKey: "contentTitle",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nội dung" />,
    cell: ({ row }) => {
      const label = labels.find((label) => label.value === row.original.contentTitle)

      return (
        <Link href={row.original.contentUrl} className="flex space-x-2">
          {label && <Badge variant="outline">{label.label}</Badge>}
          <span className="max-w-[500px] truncate font-medium">{row.getValue("contentTitle")}</span>
        </Link>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
    cell: ({ row }) => {
      const status = statuses.find((status) => status.value === row.getValue("status"))

      if (!status) {
        return null
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "mobileOnly",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Khả dụng" />,
    cell: ({ row }) => {
      const priority = priorities.find(
        (priority) => priority.value === (row.getValue("mobileOnly") as boolean).toString()
      )

      if (!priority) {
        return null
      }

      return (
        <div className="flex items-center truncate">
          {priority.icon && <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
          <span>{priority.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Thời gian" />,
    cell: ({ row }) => {
      return <time className="truncate">{formatToNow(row.original.createdAt)}</time>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} labels={labels} />,
  },
]
