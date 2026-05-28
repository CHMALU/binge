"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { FiUser, FiLogOut, FiBookmark, FiCheckCircle, FiZap } from "react-icons/fi";
import SearchBar from "./SearchBar";
import LanguageSwitcher from "./LanguageSwitcher";
import ColorVisionSwitcher, { type ColorModeDict } from "./ColorVisionSwitcher";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type NavDict = Dictionary["nav"];
type CommonDict = Dictionary["common"];

export default function Navbar({
  lang,
  dict,
  commonDict,
  colorModeDict,
}: {
  lang: string;
  dict: NavDict;
  commonDict: CommonDict;
  colorModeDict: ColorModeDict;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : session?.user?.email?.[0].toUpperCase() ?? "?";

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-surface/[0.82] backdrop-blur-lg">
      <div className="max-w-[1440px] mx-auto px-6 xl:px-12 flex items-center gap-6 h-16">
        <Link href={`/${lang}`} className="flex items-center gap-2.5 shrink-0">
          <span
            className="w-9 h-9 rounded-[10px] grid place-items-center text-black font-black text-lg leading-none select-none font-poppins"
            style={{
              background: "linear-gradient(135deg, var(--color-gold-400), var(--color-gold-500))",
              boxShadow: "0 4px 16px rgba(255,205,0,0.35)",
            }}
          >
            B
          </span>
          <span className="text-xl font-extrabold tracking-tight text-fg font-poppins">
            Binge
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {[
            { label: dict.discover, href: `/${lang}/swipe` },
            { label: dict.movies, href: `/${lang}` },
            { label: dict.series, href: `/${lang}` },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 text-fg-muted hover:text-fg hover:bg-surface-card"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex-1 max-w-sm">
          <SearchBar placeholder={dict.searchPlaceholder} commonDict={commonDict} />
        </div>

        <div className="ml-auto flex items-center gap-3 shrink-0">
          <ColorVisionSwitcher dict={colorModeDict} />
          <LanguageSwitcher lang={lang} ariaLabel={dict.changeLanguage} />

          {!session && (
            <button
              onClick={() => router.push(`/${lang}/login`)}
              className="px-4 py-2 rounded-lg text-sm font-semibold border transition-colors hover:bg-surface-card border-border-strong text-fg"
            >
              {dict.signIn}
            </button>
          )}

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => session ? setDropdownOpen((v) => !v) : router.push(`/${lang}/login`)}
              className="w-9 h-9 rounded-full grid place-items-center text-xs font-bold cursor-pointer select-none shrink-0 transition-opacity hover:opacity-80"
              style={{
                background: session
                  ? "linear-gradient(135deg, var(--color-gold-400), var(--color-gold-500))"
                  : "linear-gradient(135deg, var(--color-crimson-500), var(--color-gold-400))",
                color: "var(--color-action-fg)",
              }}
            >
              {session ? initials : <FiUser size={16} />}
            </button>

            {dropdownOpen && session && (
              <div className="absolute right-0 top-12 w-56 rounded-xl border border-border overflow-hidden z-50 py-1 bg-surface-raised">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-fg truncate">
                    {session.user?.name ?? session.user?.email}
                  </p>
                  {session.user?.name && (
                    <p className="text-xs text-fg-muted truncate">{session.user.email}</p>
                  )}
                </div>

                <div className="py-1">
                  <DropdownItem icon={<FiBookmark size={15} />} label={dict.watchlist} href={`/${lang}/watchlist`} comingSoonLabel={dict.comingSoon} />
                  <DropdownItem icon={<FiCheckCircle size={15} />} label={dict.watched} href={`/${lang}/watched`} comingSoonLabel={dict.comingSoon} disabled />
                  <DropdownItem icon={<FiZap size={15} />} label={dict.discover} href={`/${lang}/swipe`} comingSoonLabel={dict.comingSoon} />
                </div>

                <div className="border-t border-border" />

                <button
                  onClick={() => signOut({ callbackUrl: `/${lang}` })}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-accent hover:bg-surface-card transition-colors cursor-pointer"
                >
                  <FiLogOut size={15} />
                  {dict.signOut}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function DropdownItem({ icon, label, href, comingSoonLabel, disabled }: {
  icon: React.ReactNode; label: string; href: string; comingSoonLabel: string; disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-fg-subtle cursor-not-allowed select-none">
        {icon}
        <span>{label}</span>
        <span className="ml-auto text-xs opacity-40">{comingSoonLabel}</span>
      </div>
    );
  }
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-fg hover:bg-surface-card transition-colors"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
