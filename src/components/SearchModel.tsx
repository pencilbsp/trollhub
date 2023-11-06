"use client";

import slug from "slug";
import Link from "next/link";
import Image from "next/image";
import { MouseEvent, useState, useTransition } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/Dialog";
import {
  Command,
  CommandItem,
  CommandList,
  CommandInput,
  CommandGroup,
  CommandEmpty,
  CommandSeparator,
} from "@/components/ui/SearchForm";

import useKeyPress from "@/hooks/useKeyPress";
import useDebounce from "@/hooks/useDebounce";

import SpinerIcon from "./icons/SpinerIcon";
import { avatarNameFallback } from "@/lib/utils";
import getSearchResult from "@/actions/getSearchResult";

const defaultState = { contents: [], creators: [] };

export default function SearchModel() {
  const [isOpen, setOpen] = useState(false);
  const [result, setResult] = useState(defaultState);

  const [isPending, startTransition] = useTransition();
  useKeyPress("k", () => setOpen(!isOpen), { metaKey: true });

  const handleGoto = (_: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>) => {
    setOpen(!isOpen);
  };

  const handleSearch = useDebounce((value: string) => {
    if (isPending) return;

    if (value) {
      startTransition(async () => {
        const data: any = await getSearchResult(value, { take: 24 });
        setResult(data);
      });
    } else {
      setResult(defaultState);
    }
  }, 500);

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 relative justify-start text-sm text-muted-foreground sm:pr-12 w-full sm:w-64">
        <span className="hidden lg:inline-flex">Tìm kiếm kênh, nội dung...</span>
        <span className="inline-flex lg:hidden">Tìm kiếm...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </DialogTrigger>

      <DialogContent className="p-0 sm:rounded-xl overflow-hidden">
        <Command shouldFilter={false}>
          <CommandInput
            onValueChange={handleSearch}
            placeholder="Tìm kiếm kênh, nội dung..."
            loadingIcon={isPending && <SpinerIcon className="mr-2" />}
          />
          <CommandList>
            <CommandEmpty>Không tìm thấy kết quả phù hợp</CommandEmpty>
            {result.contents.length > 0 && (
              <CommandGroup heading="Nội dung">
                {result.contents.map(({ id, title, thumbUrl, akaTitle, type }) => (
                  <Link key={id} href={`/${type}/${slug(title)}-${id}`} onClick={(e) => handleGoto(e)}>
                    <CommandItem className="cursor-pointer">
                      <div className="w-12 h-12 mr-2 flex-shrink-0">
                        <Image
                          width={0}
                          height={0}
                          alt={title}
                          sizes="100vh"
                          src={thumbUrl}
                          className="w-full h-full border rounded object-cover"
                        />
                      </div>

                      <div className="flex flex-col">
                        <h5 className="truncate font-bold">{title}</h5>
                        <span className="truncate">{akaTitle?.[0]}</span>
                      </div>
                    </CommandItem>
                  </Link>
                ))}
              </CommandGroup>
            )}
            {result.creators.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Kênh">
                  {result.creators.map(({ id, name, avatar, userName }) => (
                    <Link key={id} href={`/channel/${(userName as string).slice(1)}`} onClick={handleGoto}>
                      <CommandItem className="cursor-pointer">
                        <Avatar className="w-12 h-12 border mr-2">
                          <AvatarImage src={avatar} />
                          <AvatarFallback>{avatarNameFallback(name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold">{name}</span>
                          <span className="">{userName}</span>
                        </div>
                      </CommandItem>
                    </Link>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
