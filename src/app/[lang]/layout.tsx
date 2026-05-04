import { notFound } from "next/navigation";
import { hasLocale } from "./dictionaries";
import HtmlAttributes from "@/components/HtmlAttributes";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const isRtl = lang === "ar";

  return (
    <>
      <HtmlAttributes lang={lang} dir={isRtl ? "rtl" : "ltr"} />
      {children}
    </>
  );
}
