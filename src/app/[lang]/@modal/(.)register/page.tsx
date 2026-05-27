import { getDictionary, hasLocale } from "../../dictionaries";
import { notFound } from "next/navigation";
import AuthModal from "@/components/auth/AuthModal";
import RegisterForm from "@/components/auth/RegisterForm";

type Props = { params: Promise<{ lang: string }> };

export default async function RegisterModal({ params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <AuthModal closeAriaLabel={dict.common.close}>
      <RegisterForm lang={lang} t={dict.auth} modal />
    </AuthModal>
  );
}
