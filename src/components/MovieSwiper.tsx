// MovieSwiper.tsx
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SwipeCard from "@/components/SwipeMechanism";
import type { Movie } from "@/lib/tmdb";
import Link from "next/link";

interface SwipeResult {
  action: "left" | "right";
  movie: Movie;
  velocity: number;
  offset: number;
}

interface Props {
  movies: Movie[];
}

export default function MovieSwiper( {movies}: Props ) {

  const movie_selection = movies.slice(0,5);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const currentMovie = movie_selection[currentIndex];

  const handleSwipe = (result: SwipeResult) => {
    console.log("Swiped");
    // Move to next card
    setCurrentIndex((prev) => prev + 1);
  };

  useEffect(() => {
    // final result
  }, [currentIndex]);

  if (!currentMovie) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-zinc-400">Here should be the final result!</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div className="px-6 py-4">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
          ← Back
        </Link>
      </div>
    <div className="relative flex items-center justify-center min-h-[600px]">
      
      <AnimatePresence mode="popLayout">
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center blur-2xl scale-110">
              </div>
              <div className="absolute inset-0 bg-black/60"/>
              <div className="relative z-10">
                <div className="relative w-full h-screen flex items-center justify-center">
                  <SwipeCard
                    key={currentMovie.id}
                    movie={currentMovie}
                    onSwipe={handleSwipe}
                    onExit={() => {
                    if (currentIndex + 1 == movie_selection.length) {
                      console.log("Show Final Result");
                    }
                  }}
                  swipeThreshold={100}
                  velocityThreshold={0.4}
                  />
                </div>
              </div>
            </div>
      </AnimatePresence>
    </div>
    </div>
  );
}