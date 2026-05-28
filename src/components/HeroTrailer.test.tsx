import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HeroTrailer from "@/components/HeroTrailer";

const labels = {
  title: "The Super Mario Galaxy Movie",
  watchLabel: "Watch Trailer",
  trailerLabel: "Official Trailer",
  closeLabel: "Close",
};

describe("HeroTrailer", () => {
  it("renders nothing when there is no trailer key", () => {
    const { container } = render(<HeroTrailer trailerKey={null} {...labels} />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("button", { name: /watch trailer/i })).not.toBeInTheDocument();
  });

  it("shows the Watch Trailer button when a key is present", () => {
    render(<HeroTrailer trailerKey="abc123" {...labels} />);
    expect(screen.getByRole("button", { name: /watch trailer/i })).toBeInTheDocument();
  });

  it("opens a YouTube embed for the key when clicked", async () => {
    render(<HeroTrailer trailerKey="abc123" {...labels} />);

    await userEvent.click(screen.getByRole("button", { name: /watch trailer/i }));

    const iframe = screen.getByTitle("The Super Mario Galaxy Movie") as HTMLIFrameElement;
    expect(iframe.src).toContain("https://www.youtube.com/embed/abc123");
  });

  it("closes the lightbox via the close button", async () => {
    render(<HeroTrailer trailerKey="abc123" {...labels} />);

    await userEvent.click(screen.getByRole("button", { name: /watch trailer/i }));
    expect(screen.getByTitle("The Super Mario Galaxy Movie")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(screen.queryByTitle("The Super Mario Galaxy Movie")).not.toBeInTheDocument();
  });
});
