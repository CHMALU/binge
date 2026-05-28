import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DetailActions from "@/components/DetailActions";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }),
}));

jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

const dict = {
  rating: "Rate this", movie: "Movie", series: "Series", rate: "Rate",
  selectRating: "Select a rating", cancel: "Cancel", submit: "Submit",
  saving: "Saving...", error: "Error", success: "Saved!", signInToRate: "Sign in to rate",
  markWatched: "Mark as watched", howWouldYouRate: "How would you rate it?",
  skipRating: "Skip rating", unmarkWatched: "Unmark as watched",
} as never;

const watchlistDict = {
  addToWatchlist: "Add to watchlist", inWatchlist: "In watchlist", signInToSave: "Sign in to save",
  addError: "err", addedToast: "added", removedToast: "removed", removeError: "err",
  markedToast: "Marked as watched", markedError: "err",
  unmarkWatched: "Unmark as watched", unmarkedToast: "Removed from watched", unmarkError: "err",
} as never;

const originalFetch = global.fetch;
afterEach(() => {
  jest.clearAllMocks();
  global.fetch = originalFetch;
});

describe("DetailActions coordination", () => {
  it("shows both watchlist + mark-watched actions when not watched", () => {
    render(
      <DetailActions
        tmdbId={1} mediaType="movie" lang="en" isAuthed title="Inception"
        dict={dict} watchlistDict={watchlistDict}
        initiallyInWatchlist={false} initiallyWatched={false}
      />
    );
    expect(screen.getByRole("button", { name: /add to watchlist/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^mark as watched$/i })).toBeInTheDocument();
  });

  it("hides the watchlist button once the title is marked watched", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });

    render(
      <DetailActions
        tmdbId={1} mediaType="movie" lang="en" isAuthed title="Inception"
        dict={dict} watchlistDict={watchlistDict}
        initiallyInWatchlist initiallyWatched={false}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /^mark as watched$/i }));
    await userEvent.click(screen.getByRole("button", { name: /skip rating/i }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /unmark as watched/i })).toBeInTheDocument()
    );
    // watchlist button is gone — the two actions no longer fight each other
    expect(screen.queryByRole("button", { name: /add to watchlist/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /in watchlist/i })).not.toBeInTheDocument();
  });
});
