import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import RemoveFromWatchlistButton from "@/components/RemoveFromWatchlistButton";

const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

const t = {
  remove: "Remove",
  removedToast: "Removed from watchlist",
  removeError: "Could not remove",
};

const originalFetch = global.fetch;

afterEach(() => {
  jest.clearAllMocks();
  global.fetch = originalFetch;
});

describe("RemoveFromWatchlistButton", () => {
  it("renders a trash button labelled with t.remove", () => {
    render(<RemoveFromWatchlistButton tmdbId={42} mediaType="movie" t={t} />);

    const btn = screen.getByRole("button", { name: /remove/i });
    expect(btn).toBeEnabled();
  });

  it("DELETEs /api/watchlist with the correct body on click", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    render(<RemoveFromWatchlistButton tmdbId={1399} mediaType="tv" t={t} />);

    await userEvent.click(screen.getByRole("button", { name: /remove/i }));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/watchlist",
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({ tmdbId: 1399, mediaType: "tv" }),
      })
    );
  });

  it("shows success toast and refreshes the router on success", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    render(<RemoveFromWatchlistButton tmdbId={42} mediaType="movie" t={t} />);

    await userEvent.click(screen.getByRole("button", { name: /remove/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Removed from watchlist");
    });
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("shows error toast and does not refresh on API failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "boom" }),
    });

    render(<RemoveFromWatchlistButton tmdbId={42} mediaType="movie" t={t} />);

    await userEvent.click(screen.getByRole("button", { name: /remove/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Could not remove");
    });
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
