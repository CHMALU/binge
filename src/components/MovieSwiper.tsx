// MovieSwiper.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import NextImage from "next/image";
import SwipeCard from "@/components/SwipeMechanism";
import { getRelatedTitles, type Movie } from "@/lib/tmdb";
import Link from "next/link";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
import type { Dictionary } from "@/app/[lang]/dictionaries";

const SWIPE_DECK_SIZE = 10;

type SwipeAction = "left" | "right";

interface SwipeResult {
  action: SwipeAction;
  movie: Movie;
  velocity: number;
  offset: number;
}

interface MatchResult {
  movie: Movie;
  score: number;
}

interface Props {
  movies: Movie[];
  lang: string;
  commonDict: Dictionary["common"];
  swipeDict: Dictionary["swipe"];
}

type SwipeCardRef = {
  swipeLeft: () => void;
  swipeRight: () => void;
};

function getMovieLabel(movie: Movie) {
  return movie.title ?? movie.name ?? `#${movie.id}`;
}

function getMediaType(movie: Movie): "movie" | "tv" {
  return movie.media_type ?? (movie.name ? "tv" : "movie");
}

export function calculateSwipeMatch(
  swipes: SwipeResult[],
  relatedMoviesById: Record<number, Movie[]>,
  selectedMovies: Movie[]
): MatchResult | null {
  return calculateSwipeMatches(swipes, relatedMoviesById, selectedMovies)[0] ?? null;
}

export function calculateSwipeMatches(
  swipes: SwipeResult[],
  relatedMoviesById: Record<number, Movie[]>,
  selectedMovies: Movie[]
): MatchResult[] {
  const blockedIds = new Set(selectedMovies.map((movie) => movie.id));
  const candidateScores = new Map<number, MatchResult>();

  for (const swipe of swipes) {
    const relatedMovies = relatedMoviesById[swipe.movie.id] ?? [];

    relatedMovies.slice(0, 12).forEach((candidate, index) => {
      if (blockedIds.has(candidate.id)) 
        return;

      const current = candidateScores.get(candidate.id) ?? {
        movie: candidate,
        score: 0,
      };

      const directionWeight = swipe.action === "right" ? 1 : -1;
      const rankWeight = 1 / (index + 1);
      const ratingWeight = 1 + Math.max((candidate.vote_average ?? 0) - 6, 0) / 10;

      current.score += directionWeight * rankWeight * ratingWeight;

      candidateScores.set(candidate.id, current);
    });
  }

  return [...candidateScores.values()]
    .sort((left, right) => {
      if (right.score !== left.score) 
        return right.score - left.score;
      return (right.movie.vote_average ?? 0) - (left.movie.vote_average ?? 0);
    })
    .slice(0, 3);
}

function getMatchRankLabel(index: number, swipeDict: Dictionary["swipe"]) {
  if (index === 0) 
    return swipeDict.topPick;
  if (index === 1) 
    return swipeDict.secondPick;
  return swipeDict.thirdPick;
}

function getMatchAccuracyPercent(matchScore: number, bestScore: number) {
  if (bestScore <= 0)
    bestScore = 0.1;

  const percent = Math.round((matchScore / bestScore) * 100);
  return Math.max(30, Math.min(100, percent));
}

export default function MovieSwiper({ movies, lang, commonDict, swipeDict }: Props) {
  const shuffledMovies = useMemo(() => {
    if (process.env.NODE_ENV === "test") 
      return [...movies];

    const arr = [...movies];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }, [movies]);

  const movieSelection = useMemo(() => shuffledMovies.slice(0, SWIPE_DECK_SIZE), [shuffledMovies]);
  const movieSelectionKey = movieSelection.map((movie) => movie.id).join("|");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipes, setSwipes] = useState<SwipeResult[]>([]);
  const [relatedMoviesById, setRelatedMoviesById] = useState<Record<number, Movie[]>>({});
  const [relatedTitlesLoaded, setRelatedTitlesLoaded] = useState(false);

  const currentMovie = movieSelection[currentIndex];
  const isFinished = currentIndex >= movieSelection.length;
  const swipeInfo = currentIndex === 0;
  const cardRef = useRef<SwipeCardRef>(null);
  const cardSize = "min(88vw, calc((100svh - 220px) * 2 / 3), 420px)";

  useEffect(() => {
    let active = true;

    async function loadRelatedMovies() {
      setRelatedTitlesLoaded(false);
      const entries = await Promise.all(
        movieSelection.map(async (movie) => [movie.id, await getRelatedTitles(getMediaType(movie), movie.id, lang)] as const)
      );

      if (active) {
        setRelatedMoviesById(Object.fromEntries(entries));
        setRelatedTitlesLoaded(true);
      }
    }

    setRelatedMoviesById({});
    setRelatedTitlesLoaded(false);

    if (movieSelection.length > 0) {
      loadRelatedMovies().catch((error) => {
        console.error("Failed to load related swipe titles:", error);
        if (active) {
          setRelatedMoviesById({});
          setRelatedTitlesLoaded(true);
        }
      });
    } else {
      setRelatedTitlesLoaded(true);
    }

    return () => {
      active = false;
    };
  }, [lang, movieSelectionKey, shuffledMovies]);

  const finalMatches = useMemo(
    () => calculateSwipeMatches(swipes, relatedMoviesById, movieSelection),
    [movieSelection, relatedMoviesById, swipes]
  );

  const handleSwipe = (result: SwipeResult) => {
    setSwipes((previous) => [...previous, result]);
  };

  return (
    <div className="relative w-full min-h-[calc(100svh-80px)] overflow-hidden">
      <div className="px-6 py-4">
        <Link href={`/${lang}`} className="text-sm text-fg-muted hover:text-fg transition-colors inline-flex items-center gap-1">
          <IoArrowBack aria-hidden="true" /> {commonDict.back}
        </Link>
      </div>
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute right-[20%] top-[10%] w-[30%] h-[70%] blur-[100px] rounded-full"
          style={{ background: "color-mix(in srgb, var(--color-success) 20%, transparent)" }}
          animate={{
            x: [0, 100, -60, 0],
            y: ["10%", "15%", "5%", "10%"],
            rotate: [-20, -15, -5, -10, -35, -30],
            scale: [1, 1.1, 0.95, 1, 1.05, 0.95, 1],
            opacity: [0.8, 1, 0.7, 0.8],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute left-[20%] top-[10%] w-[30%] h-[70%] blur-[100px] rounded-full"
          style={{ background: "color-mix(in srgb, var(--color-danger) 20%, transparent)" }}
          animate={{
            x: [0, 100, -60, 0],
            y: ["10%", "15%", "5%", "10%"],
            rotate: [20, 15, 5, 10, 35, 30],
            scale: [1, 1.1, 0.95, 1],
            opacity: [0.8, 1, 0.7, 0.8],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative flex min-h-[calc(100svh-120px)] flex-col items-center justify-center gap-5 px-4 py-4">
        {swipeInfo && !isFinished && (
          <div className="flex gap-8 items-center">
            <IoArrowBack className="text-2xl scale-x-[3]" aria-hidden="true" />
            <span className="text-2xl tracking-[0.4em] font-bold uppercase">
              {swipeDict.label}
            </span>
            <IoArrowForward className="text-2xl scale-x-[3]" aria-hidden="true" />
          </div>
        )}

        <div className="flex flex-col items-center gap-5" style={{ "--card-size": cardSize } as React.CSSProperties}>
          <AnimatePresence>
            {isFinished ? (
              <div className="w-full max-w-3xl rounded-3xl border border-border bg-surface-raised/90 p-6 shadow-2xl backdrop-blur-md md:p-8">
                {!relatedTitlesLoaded ? (
                  <div className="flex min-h-[320px] items-center justify-center text-center">
                    <p className="text-lg text-fg-muted">Finding your match...</p>
                  </div>
                ) : finalMatches.length > 0 ? (
                  <div className="flex flex-col gap-6">
                    <div className="text-center">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
                        {swipeDict.resultsTitle}
                      </p>
                      <h2 className="mt-2 text-3xl font-bold tracking-tight font-poppins">
                        {swipeDict.resultsHeading}
                      </h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      {finalMatches.map((match, index) => {
                        const matchMediaType = match.movie.media_type ?? (match.movie.name ? "tv" : "movie");

                        return (
                          <article
                            key={match.movie.id}
                            className="overflow-hidden rounded-3xl border border-border bg-surface-card shadow-lg"
                          >
                            <div className="relative aspect-[2/3] bg-surface-raised">
                              {match.movie.poster_path ? (
                                <NextImage
                                  src={`https://image.tmdb.org/t/p/w500${match.movie.poster_path}`}
                                  alt={getMovieLabel(match.movie)}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 320px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-sm text-fg-subtle">
                                  {commonDict.noPoster}
                                </div>
                              )}

                              <div className="absolute left-4 top-4 rounded-full bg-surface/85 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-gold-400 backdrop-blur-md">
                                #{index + 1}
                              </div>
                            </div>

                            <div className="flex flex-col gap-4 p-5">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fg-subtle">
                                  {getMatchRankLabel(index, swipeDict)}
                                </p>
                                <h3 className="mt-2 text-xl font-bold leading-tight">
                                  {getMovieLabel(match.movie)}
                                </h3>
                              </div>

                              {/* Show normalized accuracy percentage instead of raw liked sources */}
                              <div className="flex flex-col gap-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fg-subtle">
                                  {swipeDict.accuracyLabel}
                                </p>
                                {(() => {
                                  const bestScore = finalMatches[0]?.score ?? match.score;
                                  const accuracy = getMatchAccuracyPercent(match.score, bestScore);

                                  return (
                                    <div className="flex items-center gap-3">
                                      <div className="text-sm font-bold tabular-nums">{accuracy}%</div>
                                      <div className="h-2 w-full max-w-[120px] overflow-hidden rounded-full bg-surface-border">
                                        <div
                                          className="h-full bg-action"
                                          style={{ width: `${accuracy}%` }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>

                              <Link
                                href={`/${lang}/${matchMediaType}/${match.movie.id}`}
                                className="inline-flex items-center justify-center rounded-xl bg-action px-4 py-3 text-sm font-bold text-action-fg transition-colors hover:bg-action-hover"
                              >
                                {swipeDict.openDetails}
                              </Link>

                            </div>
                          </article>
                        );
                      })}
                    </div>

                    <div className="flex justify-center">
                      <Link
                        href={`/${lang}`}
                        className="inline-flex items-center justify-center rounded-xl border border-border bg-surface-card px-5 py-3 text-sm font-medium text-fg transition-colors hover:bg-surface-hover"
                      >
                        {swipeDict.backHome}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-center">
                    <p className="text-lg font-semibold text-fg">{swipeDict.noMatch}</p>
                    <p className="max-w-md text-sm text-fg-muted">
                      {swipeDict.noMatchHint}
                    </p>
                    <Link
                      href={`/${lang}`}
                      className="inline-flex items-center justify-center rounded-xl bg-action px-5 py-3 text-sm font-bold text-action-fg transition-colors hover:bg-action-hover"
                    >
                      {swipeDict.backHome}
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-full flex items-center justify-center overflow-visible py-4">
                <div className="absolute inset-0 bg-cover bg-center blur-2xl scale-110" />
                <div className="relative z-10">
                  <div className="relative w-full flex items-center justify-center">
                    {currentMovie && (
                      <SwipeCard
                        ref={cardRef}
                        key={currentMovie.id}
                        movie={currentMovie}
                        TopCard={currentIndex === 0}
                        onSwipe={handleSwipe}
                        onExit={() => {
                          setCurrentIndex((previous) => previous + 1);
                        }}
                        swipeThreshold={100}
                        velocityThreshold={0.4}
                        commonDict={commonDict}
                        swipeDict={swipeDict}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>

          {!isFinished && (
            <div className="flex gap-20">
              <div className="flex flex-col items-center gap-2">
                <button
                  aria-label={swipeDict.dislike}
                  className="px-7 py-7 rounded-full text-sm font-semibold bg-danger hover:bg-accent-hover transition-colors"
                  style={{
                    boxShadow: "0 0 30px color-mix(in srgb, var(--color-danger) 60%, transparent)",
                    color: "var(--color-danger-fg)",
                  }}
                  onClick={() => {
                    cardRef.current?.swipeLeft();
                  }}
                >
                  <FaThumbsDown className="inline-block" size={20} />
                </button>
                <span className="text-sm font-semibold uppercase tracking-wider text-fg">{swipeDict.dislike}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button
                  aria-label={swipeDict.like}
                  className="px-7 py-7 rounded-full text-sm font-semibold transition-colors bg-success hover:bg-success-hover"
                  style={{
                    boxShadow: "0 0 30px color-mix(in srgb, var(--color-success) 60%, transparent)",
                    color: "var(--color-success-fg)",
                  }}
                  onClick={() => {
                    cardRef.current?.swipeRight();
                  }}
                >
                  <FaThumbsUp className="inline-block" size={20} />
                </button>
                <span className="text-sm font-semibold uppercase tracking-wider text-fg">{swipeDict.like}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
