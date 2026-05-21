"use client";

import { useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";
import { IoClose } from "react-icons/io5";

export default function AuthModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const close = useCallback(() => router.back(), [router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [close]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 text-(--text)"
      onClick={close}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />
      <div
        className="relative z-10 w-full max-w-[420px] animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute top-3 right-3 z-20 inline-flex items-center justify-center text-[var(--text-dim)] hover:text-[var(--text)] bg-transparent border-none cursor-pointer text-lg leading-none p-1"
          aria-label="Close"
        >
          <IoClose aria-hidden="true" />
        </button>
        {children}
      </div>
      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: translateY(-12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }
        .animate-modal-in { animation: modal-in 0.18s ease; }
      `}</style>
    </div>
  );
}
