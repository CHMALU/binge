import { getDictionary, hasLocale } from "../dictionaries";
import { notFound } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";

type Props = { params: Promise<{ lang: string }> };

export default async function LoginPage({ params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-(--bg) [background-image:radial-gradient(800px_600px_at_50%_0%,rgba(255,205,0,0.07),transparent_70%)]">
      <div className="w-full max-w-sm">
        <LoginForm lang={lang} t={dict.auth} />
      </div>
    </div>
  );
}
