// MovieSwiper.tsx
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SwipeCard from "@/components/SwipeMechanism";
import type { Movie } from "@/lib/tmdb";
import Link from "next/link";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa"; 
import 'primeicons/primeicons.css'
import { useRef } from "react";

interface SwipeResult {
  action: "left" | "right";
  movie: Movie;
  velocity: number;
  offset: number;
}

interface Props {
  movies: Movie[];
}

type SwipeCardRef = {
  swipeLeft: () => void;
  swipeRight: () => void;
};

export default function MovieSwiper( {movies}: Props ) {

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
    <div className="relative w-full h-screen">
      <div className="px-6 py-4">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
          ← Back
        </Link>
      </div>
    <div className="absolute inset-0 pointer-events-none">
      <motion.div className="absolute right-[20%] top-[10%] w-[30%] h-[70%] bg-red-500/20 blur-[100px] rounded-full"
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
      <motion.div className="absolute left-[20%] top-[10%] w-[30%] h-[70%] bg-green-500/20 blur-[100px] rounded-full"
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
    <div className="relative flex flex-col items-center justify-center min-h-[600px] mt-10">
      {swipeInfo && (
        <div className="flex gap-8">
        <i className="pi pi-arrow-left scale-x-300 pr-5 " style={{ fontSize: '1.5rem'}}/>
        <span className="text-2xl tracking-[0.4em] text-bold uppercase">
          Swipe
        </span>
        <i className="pi pi-arrow-right scale-x-300 pl-4" style={{ fontSize: '1.5rem'}}/>
      </div>
      )}
      
      <AnimatePresence>
        <div className="relative w-full flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center blur-2xl scale-110">
              </div>
              <div className="relative z-10">
                <div className="relative w-full flex items-center justify-center mt-20 mb-20">
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
                  />
                </div>
              </div>
            </div>
      </AnimatePresence>
      <div className="flex gap-20">
        <button
            className="px-7 py-7 rounded-full text-sm font-semibold transition-colors hover:bg-[var(--emerald-warm)] mr-30 bg-[var(--emerald)] shadow-[0_0_30px_rgba(34,197,94,0.6)]"
            onClick={() => {
              console.log("Positive!");
              cardRef.current?.swipeLeft();
            }}
          >
            <FaThumbsUp className="inline-block" size={20}/>
        </button>
        <button
            className="px-7 py-7 rounded-full text-sm font-semibold hover:bg-[var(--crimson-warm)] bg-[var(--crimson)] transition-colors shadow-[0_0_30px_rgba(239,68,68,0.6)]"
            onClick={() => {
              console.log("Negative!");
              cardRef.current?.swipeRight();
            }}
          >
            <FaThumbsDown className="inline-block" size={20}/>
        </button>
      </div>
      
    </div>
    </div>
  );
}