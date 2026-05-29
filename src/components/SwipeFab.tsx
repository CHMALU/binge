"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IoPlay } from "react-icons/io5";
import { cn } from "@/lib/utils";

/**
 * Floating swipe CTA. Pill on desktop, collapses to a circle once the user
 * scrolls past the hero (and always a circle on mobile). Logical `end-6`
 * keeps it bottom-right in LTR and bottom-left in RTL.
 */
export default function SwipeFab({ lang, label }: { lang: string; label: string }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    function onScroll() {
      setCollapsed(window.scrollY > 240);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Link
      href={`/${lang}/swipe`}
      aria-label={label}
      title={label}
      className={cn(
        "fixed bottom-6 end-6 z-40 inline-flex items-center justify-center h-[54px] rounded-full bg-action text-action-fg font-bold transition-all hover:bg-action-hover",
        collapsed ? "w-[54px]" : "w-[54px] sm:w-auto sm:px-6 sm:gap-2",
      )}
      style={{ boxShadow: "0 10px 30px -6px rgba(255,205,0,0.5)" }}
    >
      <IoPlay size={22} aria-hidden="true" />
      <span className={cn("whitespace-nowrap text-sm", collapsed ? "hidden" : "hidden sm:inline")}>
        {label}
      </span>
    </Link>
  );
}
