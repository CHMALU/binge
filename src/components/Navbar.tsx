"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { FiUser, FiLogOut, FiBookmark, FiCheckCircle, FiZap } from "react-icons/fi";
import SearchBar from "./SearchBar";
import LanguageSwitcher from "./LanguageSwitcher";
import type { Dictionary } from "@/app/[lang]/dictionaries";

type NavDict = Dictionary["nav"];

export default function Navbar({ lang, dict }: { lang: string; dict: NavDict }) {
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
    <nav
      className="sticky top-0 z-40 border-b"
      style={{
        background: "rgba(10,10,15,0.82)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-6 xl:px-12 flex items-center gap-6 h-16">
        <Link href={`/${lang}`} className="flex items-center gap-2.5 shrink-0">
          <span
            className="w-9 h-9 rounded-[10px] grid place-items-center text-black font-black text-lg leading-none select-none"
            style={{
              background: "linear-gradient(135deg, var(--gold), var(--gold-warm))",
              boxShadow: "0 4px 16px rgba(255,205,0,0.35)",
              fontFamily: "var(--font-poppins, inherit)",
            }}
          >
            B
          </span>
          <span
            className="text-xl font-extrabold tracking-tight"
            style={{ fontFamily: "var(--font-poppins, inherit)", color: "var(--text)" }}
          >
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
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text)";
                (e.currentTarget as HTMLElement).style.background = "var(--bg-card)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex-1 max-w-sm">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-3 shrink-0">
          <LanguageSwitcher lang={lang} />

          {!session && (
            <button
              onClick={() => router.push(`/${lang}/login`)}
              className="px-4 py-2 rounded-lg text-sm font-semibold border transition-colors hover:bg-binge-card"
              style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
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
                  ? "linear-gradient(135deg, var(--gold), var(--gold-warm))"
                  : "linear-gradient(135deg, var(--crimson), var(--gold))",
                color: "#0a0a0f",
              }}
            >
              {session ? initials : <FiUser size={16} />}
            </button>

            {dropdownOpen && session && (
              <div
                className="absolute right-0 top-12 w-56 rounded-xl border overflow-hidden z-50 py-1"
                style={{ background: "var(--bg-elev)", borderColor: "var(--border)" }}
              >
                <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                  <p className="text-sm font-semibold text-binge-text truncate">
                    {session.user?.name ?? session.user?.email}
                  </p>
                  {session.user?.name && (
                    <p className="text-xs text-binge-muted truncate">{session.user.email}</p>
                  )}
                </div>

                <div className="py-1">
                  <DropdownItem icon={<FiBookmark size={15} />} label="Moja lista" href={`/${lang}/watchlist`} disabled />
                  <DropdownItem icon={<FiCheckCircle size={15} />} label="Obejrzane" href={`/${lang}/watched`} disabled />
                  <DropdownItem icon={<FiZap size={15} />} label="Odkryj filmy" href={`/${lang}/swipe`} />
                </div>

                <div className="border-t" style={{ borderColor: "var(--border)" }} />

                <button
                  onClick={() => signOut({ callbackUrl: `/${lang}` })}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-binge-crimson hover:bg-binge-card transition-colors cursor-pointer"
                >
                  <FiLogOut size={15} />
                  Wyloguj
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function DropdownItem({ icon, label, href, disabled }: {
  icon: React.ReactNode; label: string; href: string; disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-binge-dim cursor-not-allowed select-none">
        {icon}
        <span>{label}</span>
        <span className="ml-auto text-xs opacity-40">wkrótce</span>
      </div>
    );
  }
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-binge-text hover:bg-binge-card transition-colors"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
