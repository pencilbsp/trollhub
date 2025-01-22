'use client';

import Link from 'next/link';
import * as React from 'react';

import Headroom from 'react-headroom';
import { ViewVerticalIcon } from '@radix-ui/react-icons';
import { HomeIcon, HammerIcon, LifeBuoyIcon } from 'lucide-react';

import NavLink from './nav-link';
import { ToggleTheme } from './toggle-theme';

import { User } from 'next-auth';
import { usePathname } from 'next/navigation';

import { UserNav } from './user-nav';
import SearchModel from './search-model';
import RequestDialog from './request-dialog';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Header() {
    const [isOpen, setOpen] = React.useState(false);
    const session = useSession();
    const pathname = usePathname();

    return (
        <Headroom
            className="relative z-50"
            onPin={() => document.body.classList.add('header-pinned')}
            onUnpin={() => document.body.classList.remove('header-pinned')}
            onUnfix={() => document.body.classList.remove('header-pinned')}
        >
            <header className="sticky top-0 z-50 flex w-full flex-col items-center justify-around bg-background/80 backdrop-blur-xl">
                <div className="container flex h-16 items-center px-4">
                    <div className="flex flex-1 items-center justify-between">
                        <Sheet open={isOpen} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <button className="mr-3 block p-0 md:hidden">
                                    <ViewVerticalIcon className="h-5 w-5" />
                                </button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex flex-col justify-between">
                                <nav className="mt-6 flex flex-col gap-3 text-lg">
                                    <NavLink onClick={() => setOpen(false)} Icon={HomeIcon} href="/">
                                        Trang chủ
                                    </NavLink>
                                    <NavLink onClick={() => setOpen(false)} Icon={LifeBuoyIcon} href="/requested">
                                        Nội dung đã yêu cầu
                                    </NavLink>
                                    <NavLink onClick={() => setOpen(false)} Icon={HammerIcon} href="/data">
                                        Dữ liệu
                                    </NavLink>
                                </nav>
                                <div className="flex w-full justify-end gap-x-3">
                                    {!session.data && (
                                        <Button asChild>
                                            <Link className="flex-1" href="/login">
                                                Đăng nhập
                                            </Link>
                                        </Button>
                                    )}
                                    <ToggleTheme className="inline-flex" />
                                </div>
                            </SheetContent>
                        </Sheet>

                        <nav className="hidden gap-6 md:flex">
                            <NavLink href="/">Trang chủ</NavLink>
                            <NavLink href="/requested">Nội dung đã yêu cầu</NavLink>
                            <NavLink href="/data">Dữ liệu</NavLink>
                        </nav>

                        <div className="flex w-full gap-3 sm:w-auto">
                            <SearchModel />

                            <ToggleTheme />

                            <RequestDialog />

                            {session && session.data?.user ? (
                                <UserNav user={session.data.user as User} />
                            ) : (
                                <Button className="hidden lg:block" asChild>
                                    <Link href={'/login?next=' + encodeURIComponent(pathname)}>Đăng nhập</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </Headroom>
    );
}
