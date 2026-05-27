import { notFound } from "next/navigation";
import { hasLocale, LOCALES } from "./dictionaries";
import HtmlAttributes from "@/components/HtmlAttributes";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
  children,
  modal,
  params,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const isRtl = lang === "ar";

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){try{var m=localStorage.getItem('BINGE_CV_MODE');if(m&&m!=='normal'){document.documentElement.setAttribute('data-cv-mode',m);}}catch(e){}})();",
        }}
      />
      <HtmlAttributes lang={lang} dir={isRtl ? "rtl" : "ltr"} />
      {children}
      {modal}
    </>
  );
}
