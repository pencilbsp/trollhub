"use client";

import { BoltIcon } from "lucide-react";

import useSettings from "@/hooks/useSettings";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectItem,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/Select";
import {
  DropdownMenuItem,
  DropdownMenuShortcut,
} from "@/components/ui/DropdownMenu";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
} from "@/components/ui/Dialog";

export function SettingTrigger() {
  const { toggleOpenSetting } = useSettings();

  return (
    <DropdownMenuItem onClick={toggleOpenSetting}>
      Cài đặt
      <DropdownMenuShortcut>
        <BoltIcon size={20} />
      </DropdownMenuShortcut>
    </DropdownMenuItem>
  );
}

export default function SettingsDialog() {
  const {
    open,
    showAdultContent,
    playerInterface,
    toggleOpenSetting,
    toggleShowAdultContent,
    changePlayerInterface,
  } = useSettings();

  return (
    <Dialog open={open} onOpenChange={toggleOpenSetting}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cài đặt</DialogTitle>
        </DialogHeader>
        <div className="flex justify-between items-center space-x-2">
          <Label htmlFor="showAdultContent">
            Hiển thị ảnh chứa nội dung nhạy cảm
          </Label>
          <Switch
            id="showAdultContent"
            checked={showAdultContent}
            onCheckedChange={toggleShowAdultContent}
          />
        </div>
        <div className="flex justify-between items-center space-x-2">
          <Label htmlFor="playerInterface" className="flex-shrink-0">
            Giao diện trình phát video
          </Label>
          <Select value={playerInterface} onValueChange={changePlayerInterface}>
            <SelectTrigger className="max-w-min">
              <SelectValue placeholder="Giao diện trình phát" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup>
                <SelectItem value="jwplayer">Jwplayer</SelectItem>
                <SelectItem value="vidstack">Vidstack</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </DialogContent>
    </Dialog>
  );
}
