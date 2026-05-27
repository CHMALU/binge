// MovieSwiper.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SwipeCard from "@/components/SwipeMechanism";
import type { Movie } from "@/lib/tmdb";
import Link from "next/link";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface SwipeResult {
  action: "left" | "right";
  movie: Movie;
  velocity: number;
  offset: number;
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

export default function MovieSwiper( {movies, lang, commonDict, swipeDict}: Props ) {

  const movie_selection = movies.slice(0,5);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentMovie = movie_selection[currentIndex];

  const handleSwipe = (result: SwipeResult) => {
    console.log(result);

    // Move to next card
    //setCurrentIndex((prev) => prev + 1);
  };
  const swipeInfo = currentIndex === 0;
  const cardRef = useRef<SwipeCardRef>(null);
  const cardSize = "min(88vw, calc((100svh - 220px) * 2 / 3), 420px)";


  useEffect(() => {
    // final result
  }, [currentIndex]);

  if (!currentMovie) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-fg-muted">Here should be the final result!</p>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-[calc(100svh-80px)] overflow-hidden">
      <div className="px-6 py-4">
        <Link href={`/${lang}`} className="text-sm text-fg-muted hover:text-fg transition-colors inline-flex items-center gap-1">
          <IoArrowBack aria-hidden="true" /> {commonDict.back}
        </Link>
      </div>
    <div className="absolute inset-0 pointer-events-none">
      <motion.div className="absolute right-[20%] top-[10%] w-[30%] h-[70%] blur-[100px] rounded-full"
      style={{ background: "color-mix(in srgb, var(--color-danger) 20%, transparent)" }}
      animate={{
        x: [0, 100, -60, 0],
        y: ["10%", "15%", "5%", "10%"],
        rotate: [-20, -15, -5, -10, -35, -30],
        scale: [1, 1.1, 0.95, 1, 1.05, 0.95, 1],
        opacity: [0.8, 1, 0.7, 0.8]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      />
      <motion.div className="absolute left-[20%] top-[10%] w-[30%] h-[70%] blur-[100px] rounded-full"
       style={{ background: "color-mix(in srgb, var(--color-success) 20%, transparent)" }}
       animate={{
        x: [0, 100, -60, 0],
        y: ["10%", "15%", "5%", "10%"],
        rotate: [20, 15, 5, 10, 35, 30],
        scale: [1, 1.1, 0.95, 1],
        opacity: [0.8, 1, 0.7, 0.8]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }} />
    </div>
    <div className="relative flex min-h-[calc(100svh-120px)] flex-col items-center justify-center gap-5 px-4 py-4">
      {swipeInfo && (
        <div className="flex gap-8 items-center">
          <IoArrowBack className="text-2xl scale-x-[3]" aria-hidden="true" />
          <span className="text-2xl tracking-[0.4em] font-bold uppercase">
            {swipeDict.label}
          </span>
          <IoArrowForward className="text-2xl scale-x-[3]" aria-hidden="true" />
        </div>
      )}
      <div className="flex flex-col items-center gap-5"
    style={{ "--card-size": cardSize } as React.CSSProperties}>
        <AnimatePresence>
          <div className="relative w-full flex items-center justify-center overflow-visible py-4">
              <div className="absolute inset-0 bg-cover bg-center blur-2xl scale-110">
                </div>
                <div className="relative z-10">
                  <div className="relative w-full flex items-center justify-center">
                    <SwipeCard
                      ref={cardRef}
                      key={currentMovie.id}
                      movie={currentMovie}
                      TopCard={currentIndex === 0}
                      onSwipe={handleSwipe}
                      onExit={() => {
                      setCurrentIndex((prev) => prev + 1);
                      if (currentIndex + 1 == movie_selection.length) {
                        console.log("Show Final Result");
                      }
                    }}
                    swipeThreshold={100}
                    velocityThreshold={0.4}
                    commonDict={commonDict}
                    swipeDict={swipeDict}
                    />
                  </div>
                </div>
              </div>
        </AnimatePresence>
        <div className="flex gap-20">
          <div className="flex flex-col items-center gap-2">
            <button
                aria-label={swipeDict.like}
                className="px-7 py-7 rounded-full text-sm font-semibold transition-colors bg-success hover:bg-success-hover"
                style={{ boxShadow: "0 0 30px color-mix(in srgb, var(--color-success) 60%, transparent)" }}
                onClick={() => {
                  console.log("Positive!");
                  cardRef.current?.swipeLeft();
                }}
              >
                <FaThumbsUp className="inline-block" size={20}/>
            </button>
            <span className="text-sm font-semibold uppercase tracking-wider text-fg">{swipeDict.like}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button
                aria-label={swipeDict.skip}
                className="px-7 py-7 rounded-full text-sm font-semibold bg-danger hover:bg-accent-hover transition-colors"
                style={{ boxShadow: "0 0 30px color-mix(in srgb, var(--color-danger) 60%, transparent)" }}
                onClick={() => {
                  console.log("Negative!");
                  cardRef.current?.swipeRight();
                }}
              >
                <FaThumbsDown className="inline-block" size={20}/>
            </button>
            <span className="text-sm font-semibold uppercase tracking-wider text-fg">{swipeDict.skip}</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
