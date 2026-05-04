"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { MdOutlineLanguage } from "react-icons/md";

const LOCALES = [
  { code: "en", label: "EN", name: "English" },
  { code: "pl", label: "PL", name: "Polski" },
  { code: "ar", label: "AR", name: "العربية" },
];

export default function LanguageSwitcher({ lang }: { lang: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function switchLocale(newLang: string) {
    const segments = pathname.split("/");
    segments[1] = newLang;
    const newPath = segments.join("/") || `/${newLang}`;

    document.cookie = `BINGE_LOCALE=${newLang};path=/;max-age=31536000;SameSite=Lax`;
    setOpen(false);
    router.push(newPath);
  }

  return (
    <div className="relative">
      <button
        aria-label="Change language"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors hover:bg-[var(--bg-card)]"
        style={{ borderColor: "var(--border)", color: "var(--text)" }}
      >
        <MdOutlineLanguage size={18} />
        <span>{lang.toUpperCase()}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 z-50 rounded-xl overflow-hidden shadow-xl border"
            style={{ background: "var(--bg-elev)", borderColor: "var(--border)", minWidth: 140 }}
          >
            {LOCALES.map(({ code, label, name }) => (
              <button
                key={code}
                onClick={() => switchLocale(code)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors"
                style={{
                  background: code === lang ? "var(--bg-card)" : "transparent",
                  color: code === lang ? "var(--gold)" : "var(--text)",
                  fontWeight: code === lang ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (code !== lang) (e.currentTarget as HTMLElement).style.background = "var(--bg-card)";
                }}
                onMouseLeave={(e) => {
                  if (code !== lang) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <span className="font-mono font-bold text-xs w-6">{label}</span>
                <span>{name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
