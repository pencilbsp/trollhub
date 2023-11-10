"use client";

import Link from "next/link";
import * as React from "react";

import Headroom from "react-headroom";
import { ViewVerticalIcon } from "@radix-ui/react-icons";

import NavLink from "./NavLink";
import { ToggleTheme } from "./ToggleTheme";

import { User } from "next-auth";
import { usePathname } from "next/navigation";

import { UserNav } from "./UserNav";
import SearchModel from "./SearchModel";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/Sheet";
import { HomeIcon, HammerIcon, LifeBuoyIcon } from "lucide-react";

export default function Header() {
  const session = useSession();
  const pathname = usePathname();

  return (
    <Headroom className="z-50 relative">
      <header className="sticky top-0 flex flex-col justify-around items-center w-full border-b bg-background/80 backdrop-blur-xl z-50">
        <div className="container flex h-16 items-center px-4">
          <div className="flex flex-1 items-center justify-between">
            <Sheet>
              <SheetTrigger asChild>
                <button className="block md:hidden p-0 mr-3">
                  <ViewVerticalIcon className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col justify-between">
                <nav className="flex flex-col gap-3 mt-6">
                  <NavLink Icon={HomeIcon} href="/">
                    Trang chủ
                  </NavLink>
                  <NavLink Icon={HammerIcon} href="/developer">
                    Nhà phát triển
                  </NavLink>
                  <NavLink Icon={LifeBuoyIcon} href="/help">
                    Hướng dẫn
                  </NavLink>
                </nav>
                <div className="flex w-full gap-x-3 justify-end">
                  {!session.data && (
                    <Button asChild>
                      <Link className=" flex-1" href="/login">
                        Đăng nhập
                      </Link>
                    </Button>
                  )}
                  <ToggleTheme className="inline-flex" />
                </div>
              </SheetContent>
            </Sheet>

            <nav className="gap-6 hidden md:flex">
              <NavLink href="/">Trang chủ</NavLink>
              <NavLink href="/developer">Nhà phát triển</NavLink>
              <NavLink href="/help">Hướng dẫn</NavLink>
            </nav>

            <div className="flex gap-3 w-full sm:w-auto">
              <SearchModel />

              <ToggleTheme />

              <Button variant="outline" className="flex-shrink-0">
                Yêu cầu
              </Button>

              {session && session.data?.user ? (
                <UserNav user={session.data.user as User} />
              ) : (
                <Button className="hidden lg:block" asChild>
                  <Link href={"/login?next=" + encodeURIComponent(pathname)}>Đăng nhập</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
    </Headroom>
  );
}
