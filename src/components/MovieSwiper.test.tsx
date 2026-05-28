import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");

  const MockSwipeCard = React.forwardRef(function MockSwipeCard(
    {
      movie,
      onSwipe,
      onExit,
    }: {
      movie: Movie;
      onSwipe?: (result: { action: "left" | "right"; movie: Movie; velocity: number; offset: number }) => void;
      onExit?: () => void;
    },
    ref: React.ForwardedRef<{ swipeLeft: () => void; swipeRight: () => void }>
  ) {
    React.useImperativeHandle(
      ref,
      () => ({
        swipeLeft: () => {
          onSwipe?.({ action: "left", movie, velocity: 1, offset: -1 });
          onExit?.();
        },
        swipeRight: () => {
          onSwipe?.({ action: "right", movie, velocity: 1, offset: 1 });
          onExit?.();
        },
      }),
      [movie, onSwipe, onExit]
    );

    return <div data-testid="swipe-card">{movie.title ?? movie.name}</div>;
  });
  MockSwipeCard.displayName = "MockSwipeCard";
  return MockSwipeCard;
});

jest.mock("next/image", () => {
  const MockImage = ({
    fill,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => {
    void fill; // intentionally discarded — next/image-specific prop the mock doesn't need
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt ?? ""} {...props} />;
  };
  MockImage.displayName = "MockImage";
  return {
    __esModule: true,
    default: MockImage,
  };
});

const mockGetRelatedTitles = jest.fn();

jest.mock("@/lib/tmdb", () => ({
  getRelatedTitles: (...args: unknown[]) => mockGetRelatedTitles(...args),
}));

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
  {
    id: 2,
    title: "Arrival",
    poster_path: "/arrival.jpg",
    backdrop_path: null,
    vote_average: 8.0,
    overview: "A linguist...",
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
  dislike: "Dislike",
  resultsTitle: "Top matches",
  resultsHeading: "Your three strongest picks",
  openDetails: "Open details",
  backHome: "Back to home",
  topPick: "Top pick",
  secondPick: "Second pick",
  thirdPick: "Third pick",
  accuracyLabel: "Match accuracy",
  noMatch: "No strong match found.",
  noMatchHint: "Try swiping again for a better result."
};

describe("MovieSwiper action buttons", () => {
  it("renders Like and Dislike labels under the action buttons", () => {
    render(
      <MovieSwiper
        movies={movies}
        lang="en"
        commonDict={commonDict}
        swipeDict={swipeDict}
      />
    );

    expect(screen.getByText("Like")).toBeInTheDocument();
    expect(screen.getByText("Dislike")).toBeInTheDocument();
  });

  it("shows a final match that comes from the liked overlap", async () => {
    const user = userEvent.setup();

    mockGetRelatedTitles.mockImplementation(async (_mediaType: string, id: number) => {
      if (id === 1) {
        return [
          {
            id: 10,
            title: "Interstellar",
            poster_path: "/interstellar.jpg",
            backdrop_path: null,
            vote_average: 8.5,
            popularity: 120,
            overview: "Space travel.",
          },
          {
            id: 11,
            title: "Arrival",
            poster_path: "/arrival.jpg",
            backdrop_path: null,
            vote_average: 8.0,
            popularity: 115,
            overview: "First contact.",
          },
          {
            id: 12,
            title: "Blade Runner 2049",
            poster_path: "/blade-runner.jpg",
            backdrop_path: null,
            vote_average: 8.2,
            popularity: 110,
            overview: "Neo-noir sci-fi.",
          },
        ];
      }

      return [
        {
          id: 10,
          title: "Interstellar",
          poster_path: "/interstellar.jpg",
          backdrop_path: null,
          vote_average: 8.5,
          popularity: 120,
          overview: "Space travel.",
        },
        {
          id: 11,
          title: "Arrival",
          poster_path: "/arrival.jpg",
          backdrop_path: null,
          vote_average: 8.0,
          popularity: 115,
          overview: "First contact.",
        },
        {
          id: 13,
          title: "Dune",
          poster_path: "/dune.jpg",
          backdrop_path: null,
          vote_average: 8.1,
          popularity: 118,
          overview: "Desert travel.",
        },
      ];
    });

    render(
      <MovieSwiper
        movies={movies}
        lang="en"
        commonDict={commonDict}
        swipeDict={swipeDict}
      />
    );

    await waitFor(() => expect(screen.getByTestId("swipe-card")).toHaveTextContent("Inception"));
    await waitFor(() => expect(mockGetRelatedTitles.mock.calls.length).toBeGreaterThanOrEqual(2));

    await user.click(screen.getByRole("button", { name: "Like" }));
    await user.click(screen.getByRole("button", { name: "Like" }));

    await waitFor(() => expect(screen.getByText("Top matches")).toBeInTheDocument());
    expect(screen.getAllByRole("link", { name: "Open details" })).toHaveLength(3);
    expect(screen.getByText("Interstellar")).toBeInTheDocument();
  });
});
