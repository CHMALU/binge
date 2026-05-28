import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import CardActions from "@/components/CardActions";

const mockRefresh = jest.fn();
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: mockPush }),
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

const dict = {
  addToWatchlist: "Add to watchlist",
  inWatchlist: "In watchlist",
  signInToSave: "Sign in to save",
  addError: "Could not add to watchlist. Please try again.",
  title: "My Watchlist",
  empty: "Your watchlist is empty.",
  emptyHint: "Add titles by browsing or swiping.",
  addedOn: "Added on",
  remove: "Remove",
  addedToast: "Added to watchlist",
  removedToast: "Removed from watchlist",
  removeError: "Could not remove. Please try again.",
  markWatched: "Mark as watched",
  markedToast: "Marked as watched",
  markedError: "Could not mark as watched. Please try again.",
  unmarkWatched: "Unmark as watched",
  unmarkedToast: "Removed from watched",
  unmarkError: "Could not remove from watched. Please try again.",
};

const originalFetch = global.fetch;

afterEach(() => {
  jest.clearAllMocks();
  global.fetch = originalFetch;
});

describe("CardActions", () => {
  it("renders add-to-watchlist and mark-watched icons by default for authed users", () => {
    render(
      <CardActions
        tmdbId={1}
        mediaType="movie"
        isAuthed={true}
        lang="en"
        dict={dict}
      />
    );

    expect(screen.getByRole("button", { name: "Add to watchlist" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark as watched" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
  });

  it("shows the trash button only when showRemoveFromWatchlist is true", () => {
    render(
      <CardActions
        tmdbId={1}
        mediaType="movie"
        isAuthed={true}
        lang="en"
        dict={dict}
        showRemoveFromWatchlist
        showAddToWatchlist={false}
      />
    );

    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add to watchlist" })).not.toBeInTheDocument();
  });

  it("POSTs /api/watchlist on add click and shows success toast", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ success: true }) });

    render(
      <CardActions
        tmdbId={27205}
        mediaType="movie"
        isAuthed={true}
        lang="en"
        dict={dict}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Add to watchlist" }));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/watchlist",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ tmdbId: 27205, mediaType: "movie" }),
      }),
    );
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Added to watchlist"));
  });

  it("POSTs /api/watched on mark-watched click and shows success toast", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: true }) });

    render(
      <CardActions
        tmdbId={1399}
        mediaType="tv"
        isAuthed={true}
        lang="en"
        dict={dict}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Mark as watched" }));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/watched",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ tmdbId: 1399, mediaType: "tv" }),
      }),
    );
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Marked as watched"));
  });

  it("DELETEs /api/watchlist on trash click and shows removed toast", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: true }) });

    render(
      <CardActions
        tmdbId={42}
        mediaType="movie"
        isAuthed={true}
        lang="en"
        dict={dict}
        showRemoveFromWatchlist
        showAddToWatchlist={false}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Remove" }));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/watchlist",
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({ tmdbId: 42, mediaType: "movie" }),
      }),
    );
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Removed from watchlist"));
  });

  it("stops event propagation so the parent Link does NOT navigate", async () => {
    const parentClick = jest.fn();
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ success: true }) });

    render(
      <div onClick={parentClick} data-testid="parent">
        <CardActions
          tmdbId={1}
          mediaType="movie"
          isAuthed={true}
          lang="en"
          dict={dict}
        />
      </div>
    );

    await userEvent.click(screen.getByRole("button", { name: "Add to watchlist" }));

    expect(parentClick).not.toHaveBeenCalled();
  });

  it("redirects unauthenticated user to /lang/login on add click (no fetch)", async () => {
    global.fetch = jest.fn();

    render(
      <CardActions
        tmdbId={1}
        mediaType="movie"
        isAuthed={false}
        lang="ar"
        dict={dict}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Add to watchlist" }));

    expect(mockPush).toHaveBeenCalledWith("/ar/login");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("rolls back optimistic state + shows error toast on add failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({ error: "boom" }) });

    render(
      <CardActions
        tmdbId={1}
        mediaType="movie"
        isAuthed={true}
        lang="en"
        dict={dict}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Add to watchlist" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Could not add to watchlist. Please try again."));
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
