import { motion, PanInfo, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import NextImage from "next/image";
import { getPosterUrl, type Movie } from "@/lib/tmdb"
import { forwardRef, useImperativeHandle } from "react";

type SwipeResult = {
  action: SwipeAction;
  movie: Movie;
  velocity: number;
  offset: number;
}

type SwipeAction = "left" | "right";

type Props = {
  movie: Movie;
  onSwipe? : (result: SwipeResult) => void;
  onLeftSwipe?: (movie: Movie) => void;
  onRightSwipe?: (movie: Movie) => void;
  swipeThreshold?: number;
  velocityThreshold?: number;
  onExit?: () => void;
  TopCard?: boolean;
};


const SwipeCard = forwardRef(function SwipeCard({
  movie,
  onSwipe,
  onLeftSwipe,
  onRightSwipe,
  swipeThreshold = 120,
  velocityThreshold = 0.5,
  onExit,
  TopCard
}: Props, ref) {
  const title = movie.title ?? movie.name ?? "No title";
  const posterUrl = getPosterUrl(movie.poster_path, "w500");
  const rating = movie.vote_average?.toFixed(1);
  const releaseDate = movie.release_date ?? movie.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.3, 0.7, 1, 0.7, 0.3]);

  const [flipped, setFlipped] = useState(false);
  const [isExiting, setExiting] = useState(false);
  const [hasSwiped, setHasSwiped] = useState(false);

  const controls = useAnimation();

  const handleSwipe = async (action: SwipeAction, offset: number, velocity: number) => {
    if (isExiting) return;
    setExiting(true);

    //const exitX = action === "right" ? 1 : -1;
    //x.set(exitX);
    const exitX = offset;

    if (offset == 1 || offset == -1) {
      await controls.start({
        x: exitX > 0 ? exitX + 1500 : exitX - 1500,
        rotate: exitX * 20,
        opacity: 0,
        transition: { duration: 0.6 }
      });
    } else {
      await controls.start({
        
        x: exitX > 0 ? exitX + 1000 : exitX - 1000,
        rotate: exitX * 20,
        opacity: 0,
        transition: { duration: 0.4 }
      });
    }

    const SwipeResult: SwipeResult = {
      action,
      movie,
      velocity,
      offset,
    };

    onSwipe?.(SwipeResult);

    if (action === "right") {
      onRightSwipe?.(movie);
    } else {
      onLeftSwipe?.(movie);
    }

    setTimeout(() => {
      onExit?.();
    }, 200);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void => {
    if (isExiting) return;

    const { offset, velocity } = info;
    const swipeOffset = offset.x;

    const isSwipedRight = (swipeOffset > swipeThreshold && velocity.x >= -velocityThreshold) || velocity.x > velocityThreshold;
    const isSwipedLeft = (swipeOffset < -swipeThreshold && velocity.x <= velocityThreshold) || velocity.x < -velocityThreshold;

    if (isSwipedRight) {
      handleSwipe("right", offset.x, velocity.x);
    } else if(isSwipedLeft) {
      handleSwipe("left", offset.x, velocity.x);
    } else {
      x.set(0);
    }
  };

  useImperativeHandle(ref, () => ({
    swipeLeft: () => handleSwipe("left", -1, 1),
    swipeRight: () => handleSwipe("right", 1, 1)
  }));

  useEffect(() => {
    if (TopCard && !hasSwiped) {
      setHasSwiped(true);
    }
  }, [TopCard, hasSwiped]);

  return ( 
    <motion.div 
      style={{x, rotate, opacity}}
      drag = "x"
      dragConstraints={{left: 0, right: 0}}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      dragMomentum={false}
      onDoubleClick={() => setFlipped((prev) => !prev)}
      whileTap={{cursor: "grabbing"}}
      whileHover={!isExiting ? {scale: 1.05} : {}}
      initial={{opacity: 1}}
      animate={TopCard && hasSwiped ? {scale: 1, opacity: 1, x: [0, -100, 100, 0], rotate: [0, -5, 5, -3, 3, 0], animationDuration: 400} : controls}
      exit={{ scale: 0.8, opacity: 0}}
      transition={TopCard && hasSwiped ? {duration: 2.5, ease: "easeInOut"} : {duration: 0.3}}
      className="w-[90vw] max-w-[420px] h-[55vh] cursor-grab">
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: "spring", damping: 20}}
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d"}}>
                <div
              className="absolute w-full h-full bg-zinc-900 text-white p-3 rounded-xl flex flex-col justify-between overflow-hidden"
              style={{
                transform: "rotateY(0deg)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden"
              }}>
              {posterUrl && (
                <div className="absolute w-full h-9/10 inset-0">
                  <NextImage src={posterUrl} alt={title} fill loading="eager" className="object-cover" sizes="(max-width: 640px) 75vw"/>
                </div>
              )}
              <div className="absolute w-full h-1/10 p-3 bottom-0">
              <h3 className="text-sm font-medium text-white leading-snug line-clamp-2">{title}</h3>
              <div className="flex items-center gap-1 text-yellow-400 text-sm font-semibold">
                <span>★</span>
                <span>{rating}</span>
              </div>
              </div>
              <div className="relative z-10 flex flex-col h-full p-5">
              </div>
              </div>
            <div
              className="absolute w-full h-full bg-zinc-900 text-white p-3 rounded-xl flex flex-col justify-between"
              style={{
                transform: "rotateY(180deg)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden"
              }}>
              {posterUrl && (
                <div className="absolute inset-0">
                  <NextImage src={posterUrl} alt={title} fill loading="eager" className="object-cover opacity-20 blur-sm" sizes="(max-width: 640px) 75vw, 380px"/>
                </div>
              )}
              <div className="relativ z-10 flex flex-col h-full p-5">
                <div className="mb-4">
                  <h3 className="font-bold text-xl leading-tight mb-1">
                    {title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-zinc-40">
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      {rating}
                    </span>
                    <span>
                      {year}
                    </span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {movie.overview || "No description available."}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-800 text-center">
                    <p className="text-xs text-zinc-500">
                      Double-tap to flip back
                    </p>
                  </div>
                </div>
              </div>
        </motion.div>
      </motion.div>
  );
});

export default SwipeCard;
