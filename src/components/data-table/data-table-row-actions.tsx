"use client"

import Link from "next/link"
import { Row } from "@tanstack/react-table"
import { PlayIcon } from "lucide-react"

import { Button } from "@/components/ui/Button"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  labels: { value: string; label: string }[]
}

export function DataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  return (
    <div className="flex space-x-2 justify-end">
      <Button asChild size="sm">
        {/* @ts-ignore */}
        <Link href={row.original.url}>
          Xem <PlayIcon className="w-4 h-4 ml-1" />
        </Link>
      </Button>
      <Button asChild size="sm" className="truncate">
        {/* @ts-ignore */}
        <Link href={row.original.app} target="_blank">
          Xem trên app <PlayIcon className="w-4 h-4 ml-1" />
        </Link>
      </Button>
    </div>
    // <DropdownMenu>
    //   <DropdownMenuTrigger asChild>
    //     <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
    //       <DotsHorizontalIcon className="h-4 w-4" />
    //       <span className="sr-only">Open menu</span>
    //     </Button>
    //   </DropdownMenuTrigger>
    //   <DropdownMenuContent align="end" className="w-[160px]">
    //     <DropdownMenuItem>Edit</DropdownMenuItem>
    //     <DropdownMenuItem>Make a copy</DropdownMenuItem>
    //     <DropdownMenuItem>Favorite</DropdownMenuItem>
    //     <DropdownMenuSeparator />
    //     <DropdownMenuSub>
    //       <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
    //       <DropdownMenuSubContent>
    //         <DropdownMenuRadioGroup>
    //           {labels.map((label) => (
    //             <DropdownMenuRadioItem key={label.value} value={label.value}>
    //               {label.label}
    //             </DropdownMenuRadioItem>
    //           ))}
    //         </DropdownMenuRadioGroup>
    //       </DropdownMenuSubContent>
    //     </DropdownMenuSub>
    //     <DropdownMenuSeparator />
    //     <DropdownMenuItem>
    //       Delete
    //       <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
    //     </DropdownMenuItem>
    //   </DropdownMenuContent>
    // </DropdownMenu>
  )
}
