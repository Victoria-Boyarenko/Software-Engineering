// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import ExplainPanel from "@/components/ExplainPanel";
import type { ExplainInput } from "@/lib/explain";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const availableInput: ExplainInput = {
  roomLabel: "Engineering Hall, Room 204",
  start: 660,
  end: 720,
  isAvailable: true,
  reasonCode: "available",
  knownBookingLabels: ["Data Structures Lecture"],
};

describe("ExplainPanel", () => {
  it("renders nothing when input is null", () => {
    render(<ExplainPanel input={null} />);
    expect(screen.queryByText("AI explanation")).toBeNull();
  });

  it("shows an explanation labelled distinctly from the status", async () => {
    render(<ExplainPanel input={availableInput} />);
    await waitFor(() => {
      expect(screen.getByText("AI explanation")).toBeTruthy();
    });
    expect(screen.getByText(/authoritative/i)).toBeTruthy();
  });

  it("displays loading then resolves to text", async () => {
    render(<ExplainPanel input={availableInput} />);
    expect(screen.getByText("Generating explanation…")).toBeTruthy();
    await waitFor(() => {
      expect(screen.queryByText("Generating explanation…")).toBeNull();
    });
    expect(screen.getByText(/11:00–12:00/)).toBeTruthy();
  });

  it("shows a deterministic fallback explanation for an overlap", async () => {
    render(
      <ExplainPanel
        input={{ ...availableInput, isAvailable: false, reasonCode: "overlap" }}
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/overlaps an existing booking/i)).toBeTruthy();
    });
  });
});
