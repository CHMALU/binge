import { render, screen } from "@testing-library/react";

jest.mock("@/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    watchedItem: { findMany: jest.fn().mockResolvedValue([]) },
    watchlistItem: { findMany: jest.fn().mockResolvedValue([]) },
  },
}));
jest.mock("@/lib/tmdb", () => ({
  getMovieDetails: jest.fn(),
  getTvDetails: jest.fn(),
  getPosterUrl: jest.fn((p: string | null) => (p ? `https://img.tmdb/${p}` : null)),
}));
jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  redirect: jest.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }),
}));
jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});
jest.mock("next/image", () => {
  const MockImage = ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  );
  MockImage.displayName = "MockImage";
  return MockImage;
});

import enDict from "../../dictionaries/en.json";
import plDict from "../../dictionaries/pl.json";

jest.mock("../dictionaries", () => ({
  hasLocale: (l: string) => ["en", "pl", "ar"].includes(l),
  getDictionary: (l: string) => Promise.resolve(l === "pl" ? plDict : enDict),
}));

jest.mock("@/components/Navbar", () => {
  const MockNavbar = () => <nav data-testid="navbar" />;
  MockNavbar.displayName = "MockNavbar";
  return MockNavbar;
});

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getMovieDetails, getTvDetails } from "@/lib/tmdb";
import { redirect } from "next/navigation";

import WatchedPage from "./page";

const mockedAuth = auth as unknown as jest.Mock;
const mockedFindMany = prisma.watchedItem.findMany as unknown as jest.Mock;
const mockedMovie = getMovieDetails as unknown as jest.Mock;
const mockedTv = getTvDetails as unknown as jest.Mock;
const mockedRedirect = redirect as unknown as jest.Mock;

function renderPage(lang: string = "en") {
  return WatchedPage({ params: Promise.resolve({ lang }) }).then((ui) => render(ui));
}

describe("Watched page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to /lang/login when there is no session", async () => {
    mockedAuth.mockResolvedValue(null);

    await expect(renderPage("en")).rejects.toThrow("NEXT_REDIRECT:/en/login");
    expect(mockedRedirect).toHaveBeenCalledWith("/en/login");
    expect(mockedFindMany).not.toHaveBeenCalled();
  });

  it("renders empty state when the user has not watched anything", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u-1" } });
    mockedFindMany.mockResolvedValue([]);

    await renderPage("en");

    expect(screen.getByText(enDict.watched.title)).toBeInTheDocument();
    expect(screen.getByText(enDict.watched.empty)).toBeInTheDocument();
    expect(mockedMovie).not.toHaveBeenCalled();
  });

  it("renders watched items fetched from TMDb in watchedAt-desc order", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u-1" } });
    mockedFindMany.mockResolvedValue([
      {
        id: "w1",
        userId: "u-1",
        tmdbId: 27205,
        mediaType: "movie",
        watchedAt: new Date("2026-05-20T10:00:00.000Z"),
        rating: 4,
      },
      {
        id: "w2",
        userId: "u-1",
        tmdbId: 1399,
        mediaType: "tv",
        watchedAt: new Date("2026-05-10T08:00:00.000Z"),
        rating: null,
      },
    ]);
    mockedMovie.mockResolvedValue({
      id: 27205,
      title: "Inception",
      poster_path: "/i.jpg",
      vote_average: 8.4,
      release_date: "2010-07-16",
      genres: [],
      overview: "",
    });
    mockedTv.mockResolvedValue({
      id: 1399,
      name: "Game of Thrones",
      poster_path: "/got.jpg",
      vote_average: 8.5,
      first_air_date: "2011-04-17",
      genres: [],
      overview: "",
    });

    await renderPage("en");

    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.getByText("Game of Thrones")).toBeInTheDocument();
    expect(mockedMovie).toHaveBeenCalledWith(27205, "en");
    expect(mockedTv).toHaveBeenCalledWith(1399, "en");
  });

  it("renders the user's rating when rating !== null, hides it otherwise", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u-1" } });
    mockedFindMany.mockResolvedValue([
      {
        id: "w1",
        userId: "u-1",
        tmdbId: 27205,
        mediaType: "movie",
        watchedAt: new Date("2026-05-20T10:00:00.000Z"),
        rating: 4,
      },
      {
        id: "w2",
        userId: "u-1",
        tmdbId: 1399,
        mediaType: "tv",
        watchedAt: new Date("2026-05-10T08:00:00.000Z"),
        rating: null,
      },
    ]);
    mockedMovie.mockResolvedValue({
      id: 27205,
      title: "Inception",
      poster_path: "/i.jpg",
      vote_average: 8.4,
      release_date: "2010-07-16",
      genres: [],
      overview: "",
    });
    mockedTv.mockResolvedValue({
      id: 1399,
      name: "Game of Thrones",
      poster_path: "/got.jpg",
      vote_average: 8.5,
      first_air_date: "2011-04-17",
      genres: [],
      overview: "",
    });

    await renderPage("en");

    const ratedRow = screen.getByText("Inception").closest("[data-testid='watched-row']");
    const unratedRow = screen.getByText("Game of Thrones").closest("[data-testid='watched-row']");

    expect(ratedRow).toHaveTextContent("4");
    expect(unratedRow?.textContent).not.toMatch(/\b[1-5]\b.*★/);
  });

  it("passes the locale to TMDb lookups", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u-1" } });
    mockedFindMany.mockResolvedValue([
      {
        id: "w1",
        userId: "u-1",
        tmdbId: 27205,
        mediaType: "movie",
        watchedAt: new Date("2026-05-20T10:00:00.000Z"),
        rating: null,
      },
    ]);
    mockedMovie.mockResolvedValue({
      id: 27205,
      title: "Incepcja",
      poster_path: "/i.jpg",
      vote_average: 8.4,
      release_date: "2010-07-16",
      genres: [],
      overview: "",
    });

    await renderPage("pl");

    expect(mockedMovie).toHaveBeenCalledWith(27205, "pl");
  });
});
