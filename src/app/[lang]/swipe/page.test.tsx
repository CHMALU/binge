import { render } from "@testing-library/react";

jest.mock("@/lib/tmdb", () => ({
  getPopularMovies: jest.fn(),
  getPopularSeries: jest.fn(),
  getPosterUrl: jest.fn((p: string | null) => (p ? `https://img.tmdb/${p}` : null)),
}));
jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));
jest.mock("@/components/Navbar", () => {
  const MockNavbar = () => <nav data-testid="navbar" />;
  MockNavbar.displayName = "MockNavbar";
  return MockNavbar;
});
jest.mock("@/components/MovieSwiper", () => {
  const MockSwiper = () => <div data-testid="swiper" />;
  MockSwiper.displayName = "MockSwiper";
  return MockSwiper;
});

import enDict from "../../dictionaries/en.json";
import plDict from "../../dictionaries/pl.json";

jest.mock("../dictionaries", () => ({
  hasLocale: (l: string) => ["en", "pl", "ar"].includes(l),
  getDictionary: (l: string) => Promise.resolve(l === "pl" ? plDict : enDict),
}));

import { getPopularMovies, getPopularSeries } from "@/lib/tmdb";
import SwipeRouter from "./page";

const mockedMovies = getPopularMovies as unknown as jest.Mock;
const mockedSeries = getPopularSeries as unknown as jest.Mock;

function renderPage(lang: string) {
  return SwipeRouter({ params: Promise.resolve({ lang }) }).then((ui) => render(ui));
}

describe("Swipe page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedMovies.mockResolvedValue([]);
    mockedSeries.mockResolvedValue([]);
  });

  it("forwards the locale from the URL into the TMDb popular fetches", async () => {
    await renderPage("pl");

    expect(mockedMovies).toHaveBeenCalledWith("pl");
    expect(mockedSeries).toHaveBeenCalledWith("pl");
  });

  it("uses the URL locale for Arabic as well", async () => {
    await renderPage("ar");

    expect(mockedMovies).toHaveBeenCalledWith("ar");
    expect(mockedSeries).toHaveBeenCalledWith("ar");
  });

  it("404s for an unknown locale", async () => {
    await expect(renderPage("xx")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mockedMovies).not.toHaveBeenCalled();
    expect(mockedSeries).not.toHaveBeenCalled();
  });
});
