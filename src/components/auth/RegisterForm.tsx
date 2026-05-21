"use client";

import { useId, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import type { AuthDict } from "./LoginForm";

type Props = { lang: string; t: AuthDict; modal?: boolean };

export default function RegisterForm({ lang, t, modal = false }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { toast.error(t.errorPasswordShort); return; }
    if (password !== confirm) { toast.error(t.errorPasswordMismatch); return; }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: name || undefined }),
    });
    setLoading(false);

    if (res.status === 409) {
      toast.error(t.errorEmailInUse);
    } else if (!res.ok) {
      toast.error(t.errorGeneric);
    } else {
      toast.success(t.registerSuccess);
      router.push(`/${lang}/login`);
    }
  }

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-8">
      {!modal && (
        <div className="text-center mb-7">
          <span className="font-poppins text-[2rem] font-extrabold text-gold-400 tracking-tight">
            Binge
          </span>
          <p className="text-fg-muted text-sm mt-1">{t.tagline}</p>
        </div>
      )}

      <h1 className="font-poppins font-bold text-xl text-fg mb-6">
        {t.register}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label={t.name} type="text" value={name} onChange={setName} autoComplete="name" />
        <Field label={t.email} type="email" value={email} onChange={setEmail} autoComplete="email" required />
        <Field label={t.password} type="password" value={password} onChange={setPassword} autoComplete="new-password" required />
        <Field label={t.confirmPassword} type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" required />

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-lg py-[11px] font-bold text-[0.9rem] font-poppins transition-opacity
            bg-action text-action-fg cursor-pointer
            disabled:bg-border-strong disabled:text-fg-muted disabled:cursor-not-allowed"
        >
          {loading ? "…" : t.registerButton}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-fg-subtle">{t.orContinueWith}</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: `/${lang}` })}
        className="w-full flex items-center justify-center gap-2.5 bg-surface-raised border border-border hover:border-border-strong rounded-lg py-2.5 text-fg text-sm font-medium cursor-pointer transition-colors"
      >
        <GoogleIcon />
        {t.google}
      </button>

      <p className="text-center mt-5 text-sm text-fg-muted">
        {t.haveAccount}{" "}
        <Link href={`/${lang}/login`} replace={modal} className="text-gold-400 font-semibold hover:underline">
          {t.loginLink}
        </Link>
      </p>
    </div>
  );
}

function Field({ label, type, value, onChange, autoComplete, required }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; autoComplete?: string; required?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.8rem] text-fg-muted font-medium">{label}</label>
      <input
        id={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface-raised border border-border focus:border-action rounded-lg px-3.5 py-2.5 text-fg text-[0.9rem] outline-none transition-colors"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.6 7.3-17.4z" fill="#4285F4"/>
      <path d="M24 48c6.5 0 12-2.1 16-5.8l-7.9-6c-2.2 1.5-5 2.3-8.1 2.3-6.2 0-11.5-4.2-13.4-9.9H2.5v6.2C6.4 42.6 14.6 48 24 48z" fill="#34A853"/>
      <path d="M10.6 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6v-6.2H2.5C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.8l8.1-6.2z" fill="#FBBC05"/>
      <path d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.4 5.4 2.5 13.2l8.1 6.2C12.5 13.7 17.8 9.5 24 9.5z" fill="#EA4335"/>
    </svg>
  );
}
