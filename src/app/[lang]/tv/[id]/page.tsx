import { notFound } from "next/navigation";
import MovieDetail from "@/components/MovieDetail";
import { getTvDetails, getProvidersForLocale } from "@/lib/tmdb";
import { getDictionary, hasLocale } from "../../dictionaries";

export default async function TvPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();

  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const [dict, detail] = await Promise.all([
    getDictionary(lang),
    getTvDetails(numericId, lang),
  ]);

  const providers = await getProvidersForLocale("tv", numericId, lang);

  return <MovieDetail detail={{ ...detail, media_type: "tv" }} lang={lang} dict={dict.detail} providers={providers} />;
}
