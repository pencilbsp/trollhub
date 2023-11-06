"use client";

import React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type Props = {
  href: string;
  children: React.ReactNode;
};

export default function NavLink({ href, children }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn([
        "transition-colors hover:text-blue-600 text-foreground/60",
        isActive ? "text-blue-600" : "",
      ])}
    >
      {children}
    </Link>
  );
}
