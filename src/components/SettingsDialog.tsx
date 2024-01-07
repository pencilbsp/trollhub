"use client"

import { BoltIcon } from "lucide-react"

import useSettings from "@/hooks/useSettings"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DropdownMenuItem, DropdownMenuShortcut } from "@/components/ui/DropdownMenu"
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog"
import { Button } from "./ui/Button"

export function SettingTrigger() {
  const { toggleOpenSetting } = useSettings()

  return (
    <DropdownMenuItem onClick={toggleOpenSetting}>
      Cài đặt
      <DropdownMenuShortcut>
        <BoltIcon size={20} />
      </DropdownMenuShortcut>
    </DropdownMenuItem>
  )
}

export default function SettingsDialog() {
  const { open, showAdultContent, toggleOpenSetting, toggleShowAdultContent } = useSettings()

  return (
    <Dialog open={open} onOpenChange={toggleOpenSetting}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cài đặt</DialogTitle>
        </DialogHeader>
        <div className="flex justify-between items-center space-x-2">
          <Label htmlFor="showAdultContent">Hiển thị ảnh chứa nội dung nhạy cảm</Label>
          <Switch checked={showAdultContent} id="showAdultContent" onCheckedChange={toggleShowAdultContent} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
