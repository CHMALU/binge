import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import MarkWatchedButton from "@/components/MarkWatchedButton";

const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: jest.fn() }),
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

const detailDict = {
  overview: "Overview",
  availableOn: "Available on",
  network: "Network",
  createdBy: "Created by",
  lastAired: "Last aired",
  budget: "Budget",
  revenue: "Revenue",
  languages: "Languages",
  status: "Status",
  language: "Language",
  votes: "votes",
  viewOnIMDb: "View on IMDb",
  officialSite: "Official site",
  season: "season",
  seasons: "seasons",
  episode: "ep.",
  ratingAriaLabel: "{stars} out of 5",
  rating: "Rate this",
  movie: "Movie",
  series: "Series",
  rate: "Rate",
  selectRating: "Select a rating",
  cancel: "Cancel",
  submit: "Submit",
  saving: "Saving...",
  error: "Failed to submit rating.",
  success: "Saved!",
  signInToRate: "Sign in to rate",
  markWatched: "Mark as watched",
  howWouldYouRate: "How would you rate it?",
  skipRating: "Skip rating",
};

const watchlistDict = {
  markedToast: "Marked as watched",
  markedError: "Could not mark as watched",
};

const originalFetch = global.fetch;
afterEach(() => {
  jest.clearAllMocks();
  global.fetch = originalFetch;
});

describe("MarkWatchedButton", () => {
  it("renders a Mark-as-watched trigger button labelled from dict.markWatched", () => {
    render(
      <MarkWatchedButton
        tmdbId={1}
        mediaType="movie"
        title="Inception"
        isAuthed={true}
        lang="en"
        dict={detailDict}
        watchlistDict={watchlistDict}
      />
    );

    expect(screen.getByRole("button", { name: /mark as watched/i })).toBeInTheDocument();
  });

  it("opens a How-would-you-rate-it dialog from the trigger", async () => {
    render(
      <MarkWatchedButton
        tmdbId={1}
        mediaType="movie"
        title="Inception"
        isAuthed={true}
        lang="en"
        dict={detailDict}
        watchlistDict={watchlistDict}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /mark as watched/i }));

    expect(
      screen.getByRole("heading", { name: /how would you rate it/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /skip rating/i })).toBeInTheDocument();
  });

  it("POSTs to /api/watched with the chosen rating, fires success toast + refresh", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: true }) });

    render(
      <MarkWatchedButton
        tmdbId={27205}
        mediaType="movie"
        title="Inception"
        isAuthed={true}
        lang="en"
        dict={detailDict}
        watchlistDict={watchlistDict}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /mark as watched/i }));
    await userEvent.click(screen.getByRole("button", { name: "Rate 4 stars" }));
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/watched",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ tmdbId: 27205, mediaType: "movie", rating: 4 }),
        }),
      );
    });
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Marked as watched"));
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("Skip rating POSTs /api/watched with rating=null and still fires success toast", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: true }) });

    render(
      <MarkWatchedButton
        tmdbId={1399}
        mediaType="tv"
        title="Breaking Bad"
        isAuthed={true}
        lang="en"
        dict={detailDict}
        watchlistDict={watchlistDict}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /mark as watched/i }));
    await userEvent.click(screen.getByRole("button", { name: /skip rating/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/watched",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ tmdbId: 1399, mediaType: "tv", rating: null }),
        }),
      );
    });
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Marked as watched"));
  });

  it("renders the sign-in link instead of the trigger for guests", () => {
    render(
      <MarkWatchedButton
        tmdbId={1}
        mediaType="movie"
        title="Inception"
        isAuthed={false}
        lang="en"
        dict={detailDict}
        watchlistDict={watchlistDict}
      />
    );

    const link = screen.getByRole("link", { name: /sign in to rate/i });
    expect(link).toHaveAttribute("href", "/en/login");
  });
});
