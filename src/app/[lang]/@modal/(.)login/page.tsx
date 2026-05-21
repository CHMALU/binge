import { getDictionary, hasLocale } from "../../dictionaries";
import { notFound } from "next/navigation";
import AuthModal from "@/components/auth/AuthModal";
import LoginForm from "@/components/auth/LoginForm";

type Props = { params: Promise<{ lang: string }> };

export default async function LoginModal({ params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <AuthModal>
      <LoginForm lang={lang} t={dict.auth} modal />
    </AuthModal>
  );
}
