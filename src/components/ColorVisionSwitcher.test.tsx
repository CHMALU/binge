import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ColorVisionSwitcher, { type ColorModeDict } from "@/components/ColorVisionSwitcher";

const dict: ColorModeDict = {
  label: "Color vision",
  normal: "Default",
  redGreenSafe: "Red-green safe",
  blueYellowSafe: "Blue-yellow safe",
  highContrast: "High contrast",
};

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-cv-mode");
});

describe("ColorVisionSwitcher", () => {
  it("renders a trigger button labelled by the dict", () => {
    render(<ColorVisionSwitcher dict={dict} />);
    expect(
      screen.getByRole("button", { name: /color vision/i })
    ).toBeInTheDocument();
  });

  it("opens a menu with four mode options when the trigger is clicked", async () => {
    render(<ColorVisionSwitcher dict={dict} />);
    await userEvent.click(screen.getByRole("button", { name: /color vision/i }));

    expect(screen.getByRole("button", { name: /default/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /red-green safe/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /blue-yellow safe/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /high contrast/i })
    ).toBeInTheDocument();
  });

  it("sets data-cv-mode on the root element and persists the mode when a non-default option is selected", async () => {
    render(<ColorVisionSwitcher dict={dict} />);
    await userEvent.click(screen.getByRole("button", { name: /color vision/i }));
    await userEvent.click(
      screen.getByRole("button", { name: /red-green safe/i })
    );

    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-cv-mode")).toBe(
        "red-green"
      );
    });
    expect(localStorage.getItem("BINGE_CV_MODE")).toBe("red-green");
  });

  it("clears the root attribute and storage entry when default is selected", async () => {
    localStorage.setItem("BINGE_CV_MODE", "high-contrast");
    document.documentElement.setAttribute("data-cv-mode", "high-contrast");

    render(<ColorVisionSwitcher dict={dict} />);
    await userEvent.click(screen.getByRole("button", { name: /color vision/i }));
    await userEvent.click(screen.getByRole("button", { name: /default/i }));

    await waitFor(() => {
      expect(document.documentElement.hasAttribute("data-cv-mode")).toBe(false);
    });
    expect(localStorage.getItem("BINGE_CV_MODE")).toBeNull();
  });

  it("marks the active mode with aria-current after restoring from storage on mount", async () => {
    localStorage.setItem("BINGE_CV_MODE", "blue-yellow");

    render(<ColorVisionSwitcher dict={dict} />);
    await userEvent.click(screen.getByRole("button", { name: /color vision/i }));

    const activeOption = screen.getByRole("button", {
      name: /blue-yellow safe/i,
    });
    expect(activeOption).toHaveAttribute("aria-current", "true");
  });
});
