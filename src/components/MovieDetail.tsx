import Image from "next/image";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";
import { getPosterUrl, type MovieDetailData } from "@/lib/tmdb";

export default function MovieDetail({ detail }: { detail: MovieDetailData }) {
  const title = detail.title ?? detail.name ?? "No title";
  const originalTitle = detail.original_title ?? detail.original_name;
  const posterUrl = getPosterUrl(detail.poster_path, "w500");
  const backdropUrl = detail.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}`
    : null;
  const rating = detail.vote_average.toFixed(1);
  const releaseDate = detail.release_date ?? detail.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  const runtime =
    detail.runtime ??
    (detail.episode_run_time && detail.episode_run_time.length > 0
      ? detail.episode_run_time[0]
      : detail.last_episode_to_air?.runtime ?? null);

  const isTv = detail.media_type === "tv";
  const stars = Math.round(detail.vote_average / 2);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
      {/* Back button */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/"
          className="flex items-center justify-center w-11 h-11 rounded-full border transition-colors"
          style={{ background: "rgba(10,10,15,0.8)", backdropFilter: "blur(10px)", borderColor: "var(--border)", color: "var(--text)" }}
        >
          <IoArrowBack size={20} aria-hidden="true" />
          <span className="sr-only">Back</span>
        </Link>
      </div>

      {/* Backdrop */}
      {backdropUrl && (
        <div className="relative h-[520px] overflow-hidden">
          <Image
            src={backdropUrl}
            alt={title}
            fill
            sizes="100vw"
            className="object-cover object-center"
            style={{ filter: "saturate(1.1)" }}
            priority
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(0deg, var(--bg) 0%, rgba(10,10,15,0.4) 60%, transparent 100%)" }}
          />
        </div>
      )}

      {/* 3-column layout */}
      <div
        className="relative z-10 max-w-[1440px] mx-auto px-6 xl:px-12 pb-20"
        style={{ marginTop: backdropUrl ? -200 : 80 }}
      >
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">

          {/* Poster */}
          <div className="w-56 lg:w-[300px] shrink-0 mx-auto lg:mx-0">
            <div
              className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border"
              style={{ borderColor: "var(--border)" }}
            >
              {posterUrl ? (
                <Image src={posterUrl} alt={title} fill sizes="(max-width: 1024px) 224px, 300px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm" style={{ background: "var(--bg-card)", color: "var(--text-dim)" }}>
                  No poster
                </div>
              )}
            </div>
          </div>

          {/* Main info */}
          <div className="flex flex-col gap-5 min-w-0 flex-1">
            <div>
              <h1
                className="font-extrabold tracking-tight leading-tight mb-2"
                style={{ fontFamily: "var(--font-poppins, inherit)", fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
              >
                {title}
              </h1>
              {originalTitle && originalTitle !== title && (
                <p className="text-sm italic mb-1" style={{ color: "var(--text-dim)" }}>{originalTitle}</p>
              )}
              {detail.tagline && (
                <p className="text-base italic" style={{ color: "var(--gold)" }}>{detail.tagline}</p>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-3 text-sm py-4 border-b" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
              {year && <span>{year}</span>}
              {runtime && <span>{runtime} min</span>}
              {isTv && detail.number_of_seasons && (
                <span>
                  {detail.number_of_seasons} season{detail.number_of_seasons > 1 ? "s" : ""}
                  {detail.number_of_episodes ? ` · ${detail.number_of_episodes} ep.` : ""}
                </span>
              )}
              {detail.status && (
                <span
                  className="px-2.5 py-0.5 rounded-md text-xs font-semibold border"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: detail.status === "Returning Series" ? "var(--emerald)" : "var(--text)" }}
                >
                  {detail.status}
                </span>
              )}
            </div>

            {/* Genres */}
            {detail.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {detail.genres.map((g) => (
                  <span key={g.id} className="px-3 py-1.5 rounded-full text-sm font-medium border" style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text)" }}>
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            <div>
              <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--gold)" }}>Overview</div>
              <p className="text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>{detail.overview}</p>
            </div>

            {/* TV extras */}
            {isTv && (
              <div className="flex flex-col gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                {detail.networks && detail.networks.length > 0 && (
                  <div className="flex gap-2"><span style={{ color: "var(--text-dim)" }}>Network:</span><span>{detail.networks.map((n) => n.name).join(", ")}</span></div>
                )}
                {detail.created_by && detail.created_by.length > 0 && (
                  <div className="flex gap-2"><span style={{ color: "var(--text-dim)" }}>Created by:</span><span>{detail.created_by.map((c) => c.name).join(", ")}</span></div>
                )}
                {detail.last_air_date && (
                  <div className="flex gap-2"><span style={{ color: "var(--text-dim)" }}>Last aired:</span><span>{detail.last_air_date}</span></div>
                )}
              </div>
            )}

            {/* Movie extras */}
            {!isTv && (detail.budget ?? 0) > 0 && (
              <div className="flex flex-col gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                {(detail.budget ?? 0) > 0 && <div className="flex gap-2"><span style={{ color: "var(--text-dim)" }}>Budget:</span><span>${detail.budget!.toLocaleString()}</span></div>}
                {(detail.revenue ?? 0) > 0 && <div className="flex gap-2"><span style={{ color: "var(--text-dim)" }}>Revenue:</span><span>${detail.revenue!.toLocaleString()}</span></div>}
              </div>
            )}

            {/* Languages */}
            {detail.spoken_languages && detail.spoken_languages.length > 0 && (
              <div className="flex gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                <span style={{ color: "var(--text-dim)" }}>Languages:</span>
                <span>{detail.spoken_languages.map((l) => l.english_name).join(", ")}</span>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div
            className="w-full lg:w-[280px] shrink-0 rounded-2xl p-7 lg:sticky lg:top-24 border"
            style={{ background: "var(--bg-elev)", borderColor: "var(--border)" }}
          >
            {/* Rating box */}
            <div className="text-center pb-6 mb-6 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="font-extrabold leading-none mb-2" style={{ fontFamily: "var(--font-poppins, inherit)", fontSize: 56, color: "var(--gold)" }}>
                {rating}
                <span className="text-lg font-medium" style={{ color: "var(--text-dim)" }}>/10</span>
              </div>
              <div className="text-base tracking-widest mb-2" style={{ color: "var(--gold)" }}>
                {"★".repeat(stars)}{"☆".repeat(5 - stars)}
              </div>
              {detail.vote_count && (
                <div className="text-sm" style={{ color: "var(--text-dim)" }}>
                  {detail.vote_count.toLocaleString()} votes
                </div>
              )}
            </div>

            {/* Metadata rows */}
            {[
              detail.status && { label: "Status", value: detail.status },
              detail.spoken_languages && detail.spoken_languages.length > 0 && { label: "Language", value: detail.spoken_languages[0].english_name },
              !isTv && detail.budget && detail.budget > 0 && { label: "Budget", value: `$${detail.budget.toLocaleString()}` },
            ]
              .filter(Boolean)
              .map((row) => (
                <div key={(row as { label: string }).label} className="flex justify-between py-3 text-sm border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                  <span style={{ color: "var(--text-dim)" }}>{(row as { label: string; value: string }).label}</span>
                  <span className="font-medium text-right" style={{ color: "var(--text)" }}>{(row as { label: string; value: string }).value}</span>
                </div>
              ))}

            {/* Action links */}
            <div className="flex flex-col gap-3 mt-6">
              {detail.imdb_id && (
                <a
                  href={`https://www.imdb.com/title/${detail.imdb_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl text-sm font-bold text-center transition-colors"
                  style={{ background: "var(--gold)", color: "#000" }}
                >
                  View on IMDb
                </a>
              )}
              {detail.homepage && (
                <a
                  href={detail.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl text-sm font-semibold text-center border transition-colors"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text)" }}
                >
                  Official site
                </a>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
