import { notFound } from "next/navigation";
import { hasLocale } from "./dictionaries";

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
      {/* Set lang and dir on <html> synchronously before paint */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang="${lang}";document.documentElement.dir="${isRtl ? "rtl" : "ltr"}"`,
        }}
      />
      {children}
    </>
  );
}
