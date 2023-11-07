"use client";

import Link from "next/link";
import * as React from "react";

import { ViewVerticalIcon } from "@radix-ui/react-icons";

import NavLink from "./NavLink";
import { ToggleTheme } from "./ToggleTheme";

import { User } from "next-auth";

import { UserNav } from "./UserNav";
import SearchModel from "./SearchModel";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/Sheet";

export default function Header() {
  const session = useSession();

  return (
    <header className="sticky top-0 flex flex-col justify-around items-center w-full border-b bg-background/80 backdrop-blur-xl z-50">
      <div className="container flex h-16 items-center px-4">
        <div className="flex flex-1 items-center justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <button className="block md:hidden p-0 mr-3">
                <ViewVerticalIcon className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left"></SheetContent>
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
                <Link href="/login">Đăng nhập</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
