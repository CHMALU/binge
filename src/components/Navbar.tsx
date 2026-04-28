"use client";
import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Navbar() {
  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(10,10,15,0.82)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-6 xl:px-12 flex items-center gap-6 h-16">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
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
          {["Discover", "Movies", "Series"].map((label) => (
            <Link
              key={label}
              href="/"
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
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold border transition-colors hover:bg-[var(--bg-card)]"
            style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
          >
            Sign in
          </button>
          <div
            className="w-9 h-9 rounded-full grid place-items-center text-black text-xs font-bold cursor-pointer select-none"
            style={{ background: "linear-gradient(135deg, var(--crimson), var(--gold))" }}
          >
            MK
          </div>
        </div>
      </div>
    </nav>
  );
}
