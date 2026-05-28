import { render, screen } from "@testing-library/react";
import MovieSwiper from "@/components/MovieSwiper";
import type { Movie } from "@/lib/tmdb";
import type { Dictionary } from "@/app/[lang]/dictionaries";

jest.mock("framer-motion", () => {
  const passthrough = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
  return {
    AnimatePresence: passthrough,
    motion: new Proxy(
      {},
      {
        get: () => {
          const MockMotion = ({
            children,
            ...rest
          }: React.PropsWithChildren<Record<string, unknown>>) => (
            <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
          );
          MockMotion.displayName = "MockMotion";
          return MockMotion;
        },
      }
    ),
  };
});

jest.mock("@/components/SwipeMechanism", () => {
  const MockSwipeCard = () => <div data-testid="swipe-card" />;
  MockSwipeCard.displayName = "MockSwipeCard";
  return MockSwipeCard;
});

jest.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>;
  MockLink.displayName = "MockLink";
  return MockLink;
});

const movies: Movie[] = [
  {
    id: 1,
    title: "Inception",
    poster_path: "/inception.jpg",
    backdrop_path: null,
    vote_average: 8.8,
    overview: "A thief...",
  },
];

const commonDict: Dictionary["common"] = {
  back: "Back",
  close: "Close",
  noTitle: "No title",
  noPoster: "No poster",
  notAvailable: "N/A",
};

const swipeDict: Dictionary["swipe"] = {
  label: "Swipe",
  noDescription: "No description.",
  flipBackHint: "Double-tap to flip back",
  like: "Like",
  skip: "Skip",
};

describe("MovieSwiper action buttons", () => {
  it("renders Like and Skip labels under the action buttons", () => {
    render(
      <MovieSwiper
        movies={movies}
        lang="en"
        commonDict={commonDict}
        swipeDict={swipeDict}
      />
    );

    expect(screen.getByText("Like")).toBeInTheDocument();
    expect(screen.getByText("Skip")).toBeInTheDocument();
  });
});
