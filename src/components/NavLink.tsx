"use client";

import React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type Props = {
  href: string;
  Icon?: LucideIcon;
  className?: string;
  children: React.ReactNode;
};

export default function NavLink({ href, children, Icon, className }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn([
        "flex gap-x-2 transition-colors hover:text-blue-600 text-foreground/60",
        isActive ? "text-blue-600" : "",
        className,
      ])}
    >
      {Icon && <Icon size={22} />}
      {children}
    </Link>
  );
}
