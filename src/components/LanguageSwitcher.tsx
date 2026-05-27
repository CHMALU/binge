"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdOutlineLanguage } from "react-icons/md";
import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "en", label: "EN", name: "English" },
  { code: "pl", label: "PL", name: "Polski" },
  { code: "ar", label: "AR", name: "العربية" },
];

export default function LanguageSwitcher({ lang, ariaLabel }: { lang: string; ariaLabel: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingLocale, setPendingLocale] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingLocale) return;
    document.cookie = `BINGE_LOCALE=${pendingLocale};path=/;max-age=31536000;SameSite=Lax`;
  }, [pendingLocale]);

  function switchLocale(newLang: string) {
    const segments = pathname.split("/");
    segments[1] = newLang;
    const newPath = segments.join("/") || `/${newLang}`;

    setPendingLocale(newLang);
    setOpen(false);
    router.push(newPath);
  }

  return (
    <div className="relative">
      <button
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors hover:bg-surface-card border-border text-fg"
      >
        <MdOutlineLanguage size={18} />
        <span>{lang.toUpperCase()}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 min-w-[140px] rounded-xl overflow-hidden shadow-xl border bg-surface-raised border-border">
            {LOCALES.map(({ code, label, name }) => (
              <button
                key={code}
                onClick={() => switchLocale(code)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors",
                  code === lang
                    ? "bg-surface-card text-gold-400 font-semibold"
                    : "text-fg font-normal hover:bg-surface-card"
                )}
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
