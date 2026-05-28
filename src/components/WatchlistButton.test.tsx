import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import WatchlistButton, { type WatchlistDict } from "@/components/WatchlistButton";

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

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

const t: WatchlistDict = {
  addToWatchlist: "Add to watchlist",
  inWatchlist: "In watchlist",
  signInToSave: "Sign in to save",
  addError: "Could not save",
  addedToast: "Added to watchlist",
  removedToast: "Removed from watchlist",
  removeError: "Could not remove",
  markedToast: "Marked as watched",
  markedError: "Could not mark as watched",
};

const originalFetch = global.fetch;

afterEach(() => {
  jest.clearAllMocks();
  global.fetch = originalFetch;
});

describe("WatchlistButton", () => {
  it("renders a sign-in link when the user is not authenticated", () => {
    render(
      <WatchlistButton
        tmdbId={42}
        mediaType="movie"
        lang="en"
        isAuthed={false}
        initiallyInWatchlist={false}
        t={t}
      />
    );

    const link = screen.getByRole("link", { name: /sign in to save/i });
    expect(link).toHaveAttribute("href", "/en/login");
  });

  it("renders the add button when authed and not yet in the watchlist", () => {
    render(
      <WatchlistButton
        tmdbId={42}
        mediaType="movie"
        lang="en"
        isAuthed={true}
        initiallyInWatchlist={false}
        t={t}
      />
    );

    const btn = screen.getByRole("button", { name: /add to watchlist/i });
    expect(btn).toBeEnabled();
  });

  it("renders an enabled in-list toggle button when the item is already saved", () => {
    render(
      <WatchlistButton
        tmdbId={42}
        mediaType="movie"
        lang="en"
        isAuthed={true}
        initiallyInWatchlist={true}
        t={t}
      />
    );

    const btn = screen.getByRole("button", { name: /in watchlist/i });
    expect(btn).toBeEnabled();
  });

  it("POSTs to /api/watchlist and flips to the in-list state on success", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        item: {
          tmdbId: 42,
          mediaType: "movie",
          addedAt: "2026-05-27T00:00:00.000Z",
        },
      }),
    });

    render(
      <WatchlistButton
        tmdbId={42}
        mediaType="movie"
        lang="en"
        isAuthed={true}
        initiallyInWatchlist={false}
        t={t}
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: /add to watchlist/i })
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/watchlist",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ tmdbId: 42, mediaType: "movie" }),
      })
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /in watchlist/i })
      ).toBeEnabled();
    });

    expect(toast.success).toHaveBeenCalledWith("Added to watchlist");
  });

  it("DELETEs and flips back to the add state when toggling off", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    render(
      <WatchlistButton
        tmdbId={42}
        mediaType="movie"
        lang="en"
        isAuthed={true}
        initiallyInWatchlist={true}
        t={t}
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: /in watchlist/i })
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/watchlist",
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({ tmdbId: 42, mediaType: "movie" }),
      })
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /add to watchlist/i })
      ).toBeEnabled();
    });

    expect(toast.success).toHaveBeenCalledWith("Removed from watchlist");
  });

  it("rolls back to in-list state and shows an error toast when DELETE fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "boom" }),
    });

    render(
      <WatchlistButton
        tmdbId={42}
        mediaType="movie"
        lang="en"
        isAuthed={true}
        initiallyInWatchlist={true}
        t={t}
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: /in watchlist/i })
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Could not remove");
    });

    expect(
      screen.getByRole("button", { name: /in watchlist/i })
    ).toBeEnabled();
  });

  it("shows an error toast when the API call fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "boom" }),
    });

    render(
      <WatchlistButton
        tmdbId={42}
        mediaType="movie"
        lang="en"
        isAuthed={true}
        initiallyInWatchlist={false}
        t={t}
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: /add to watchlist/i })
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Could not save");
    });
  });
});
