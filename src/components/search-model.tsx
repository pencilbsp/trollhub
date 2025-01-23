'use client';

import slug from 'slug';
import Link from 'next/link';
import Image from 'next/image';
import { UAParser } from 'ua-parser-js';
import { SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MouseEvent, useEffect, useState, useTransition } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandItem, CommandList, CommandInput, CommandGroup, CommandEmpty, CommandSeparator } from '@/components/ui/command';

import useDebounce from '@/hooks/use-debounce';
import useKeyPress from '@/hooks/use-key-press';

import { formatToNow } from '@/lib/date';
import { avatarNameFallback } from '@/lib/utils';
import getSearchResult, { SearchResult } from '@/actions/guest/get-search-result';

const defaultState: SearchResult = { contents: [], creators: [] };

export default function SearchModel() {
    const router = useRouter();

    const [isOpen, setOpen] = useState(false);
    const [isMacOS, setMacOS] = useState(false);
    const [result, setResult] = useState(defaultState);

    const [isPending, startTransition] = useTransition();
    useKeyPress('k', () => setOpen(!isOpen), isMacOS ? { metaKey: true } : { altKey: true });

    const handleGoto = (_: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>) => {
        setOpen(!isOpen);
    };

    const handleSearch = useDebounce((value: string) => {
        if (isPending) return;

        if (value) {
            startTransition(async () => {
                const data = await getSearchResult(value, { take: 24 });
                setResult(data);
            });
        } else {
            setResult(defaultState);
        }
    }, 500);

    const handleSelect = (value: string) => {
        setOpen(false);
        router.push(value);
    };

    useEffect(() => {
        if (typeof navigator !== 'undefined') {
            const parser = new UAParser(navigator.userAgent);
            setMacOS(parser.getOS().name === 'Mac OS');
        }
    }, []);

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogTrigger className="relative inline-flex h-9 w-full items-center justify-start rounded-md border bg-transparent px-4 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50 sm:w-64 sm:pr-12">
                <span className="hidden lg:inline-flex">Tìm kiếm kênh, nội dung...</span>
                <span className="inline-flex lg:hidden">Tìm kiếm...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] opacity-100 sm:flex">
                    <span className="text-xs">{isMacOS ? '⌘' : 'Alt'}</span>K
                </kbd>
            </DialogTrigger>

            <DialogContent className="h-full overflow-hidden p-0 sm:h-auto">
                <Command shouldFilter={false} className="bg-transparent">
                    <CommandInput
                        isLoading={isPending}
                        onValueChange={handleSearch}
                        wrapperClassName="px-4 py-1.5"
                        placeholder="Tìm kiếm kênh, nội dung..."
                        icon={<SearchIcon className="h-6 w-6" />}
                        loading={<Spinner size="md" className="bg-current" />}
                        className="text-lg outline-none placeholder:text-lg placeholder:text-current"
                    />
                    {result.contents.length > 0 || result.creators.length > 0 ? (
                        <CommandList className="px-2 py-1">
                            {result.contents.length > 0 && (
                                <CommandGroup className="[&_[cmdk-group-heading]]:text-sm" heading="Nội dung">
                                    {result.contents.map(({ id, title, thumbUrl, akaTitle, type, creator, updatedAt }) => {
                                        const href = `/${type}/${slug(title)}-${id}`;
                                        return (
                                            <Link key={id} href={href} onClick={(e) => handleGoto(e)}>
                                                <CommandItem value={href} className="cursor-pointer" onSelect={handleSelect}>
                                                    <div className="mr-2 h-12 w-12 flex-shrink-0">
                                                        <Image
                                                            width={0}
                                                            height={0}
                                                            alt={title}
                                                            sizes="100vh"
                                                            src={thumbUrl}
                                                            className="h-full w-full rounded border object-cover"
                                                        />
                                                    </div>

                                                    <div className="flex min-w-0 flex-col">
                                                        <h5 className="truncate font-bold">{title}</h5>
                                                        <span className="truncate text-xs">{akaTitle?.[0]}</span>
                                                        <span className="truncate text-xs text-muted-foreground">
                                                            {creator.name}&nbsp;&#183;&nbsp;
                                                            {formatToNow(new Date(updatedAt))}
                                                        </span>
                                                    </div>
                                                </CommandItem>
                                            </Link>
                                        );
                                    })}
                                </CommandGroup>
                            )}

                            {result.creators.length > 0 && (
                                <>
                                    <CommandSeparator />
                                    <CommandGroup className="[&_[cmdk-group-heading]]:text-sm" heading="Kênh">
                                        {result.creators.map(({ id, name, avatar, userName }) => (
                                            <Link key={id} href={`/channel/${(userName as string).slice(1)}`} onClick={handleGoto}>
                                                <CommandItem className="cursor-pointer">
                                                    <Avatar className="mr-2 h-12 w-12 border">
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
                    ) : (
                        <CommandList className="px-2 py-1">
                            <CommandEmpty className="text-base">Không tìm thấy kết quả phù hợp.</CommandEmpty>
                        </CommandList>
                    )}
                </Command>
            </DialogContent>
        </Dialog>
    );
}
