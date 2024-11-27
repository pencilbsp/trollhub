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
  onClick?: VoidFunction;
  children: React.ReactNode;
};

export default function NavLink({ href, children, Icon, className, onClick }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn([
        "flex gap-x-2 transition-colors hover:text-blue-600",
        isActive ? "text-blue-600" : "",
        className,
      ])}
    >
      {Icon && <Icon size={24} />}
      {children}
    </Link>
  );
}
