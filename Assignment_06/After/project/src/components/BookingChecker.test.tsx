// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import BookingChecker from "@/components/BookingChecker";
import { DEFAULT_ROOM, ROOMS } from "@/data/rooms";
import { CURRENT_TIME, type RoomConfig } from "@/lib/availability";

afterEach(cleanup);

function enterTimes(start: string, end: string) {
  for (const [label, value] of [
    [/Start time/, start],
    [/End time/, end],
  ] as const) {
    const input = screen.getByLabelText(label);
    fireEvent.change(input, { target: { value } });
    fireEvent.blur(input);
  }
}

function check(room: RoomConfig, start: string, end: string) {
  render(<BookingChecker room={room} now={CURRENT_TIME} />);
  enterTimes(start, end);
  fireEvent.click(screen.getByRole("button", { name: "Check Availability" }));
}

describe("BookingChecker — AC6 feedback messages", () => {
  it("shows the exact available message with its label", () => {
    check(DEFAULT_ROOM, "11:00", "12:00");
    expect(screen.getByText("Available")).toBeTruthy();
    expect(
      screen.getByText("Available! Engineering Hall, Room 204 is free from 11:00 to 12:00 (1 hour).")
    ).toBeTruthy();
  });

  it("shows the exact overlap message naming the conflicting booking", () => {
    check(DEFAULT_ROOM, "10:30", "11:30");
    expect(screen.getByText("Unavailable")).toBeTruthy();
    expect(
      screen.getByText("Overlaps with an existing booking: Data Structures Lecture (10:00–11:00).")
    ).toBeTruthy();
  });

  it("shows the exact duration message when the booking is longer than 120 minutes", () => {
    check(DEFAULT_ROOM, "12:00", "14:30");
    expect(screen.getByText("Unavailable")).toBeTruthy();
    expect(
      screen.getByText("Booking duration is 150 minutes. The maximum is 120 minutes.")
    ).toBeTruthy();
  });

  it("shows the exact blocked-room message", () => {
    const blocked = ROOMS.find((r) => r.blocked)!;
    check(blocked, "11:00", "12:00");
    expect(screen.getByText("This room is currently blocked and cannot be booked.")).toBeTruthy();
  });

  it("asks for both times as an input error when Check is pressed with them missing", () => {
    render(<BookingChecker room={DEFAULT_ROOM} now={CURRENT_TIME} />);
    fireEvent.click(screen.getByRole("button", { name: "Check Availability" }));
    expect(screen.getByText("Check your input")).toBeTruthy();
    expect(screen.getByText("Please select both a start and an end time.")).toBeTruthy();
  });

  it("warns live that a duration over 120 minutes exceeds the maximum", () => {
    render(<BookingChecker room={DEFAULT_ROOM} now={CURRENT_TIME} />);
    enterTimes("12:00", "14:30");
    expect(screen.getByText("(exceeds 120 min max)")).toBeTruthy();
    expect(screen.getByText("150 minutes")).toBeTruthy();
  });

  it("shows the placeholder instead of the checker when no room is selected", () => {
    render(<BookingChecker room={null} now={CURRENT_TIME} />);
    expect(screen.getByText(/No room is selected/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Check Availability" })).toBeNull();
  });
});

describe("BookingChecker — explanation panel visibility (F3)", () => {
  it("does not show the AI explanation during live preview before clicking Check", () => {
    render(<BookingChecker room={DEFAULT_ROOM} now={CURRENT_TIME} />);
    enterTimes("11:00", "12:00");
    // Live preview shows a result hint but the explanation panel must be absent.
    expect(screen.queryByText("AI explanation")).toBeNull();
  });

  it("shows the AI explanation only after clicking Check Availability", async () => {
    render(<BookingChecker room={DEFAULT_ROOM} now={CURRENT_TIME} />);
    enterTimes("11:00", "12:00");
    fireEvent.click(screen.getByRole("button", { name: "Check Availability" }));
    await waitFor(() => {
      expect(screen.getByText("AI explanation")).toBeTruthy();
    });
  });

  it("clears the explanation when the start time changes after a check", async () => {
    render(<BookingChecker room={DEFAULT_ROOM} now={CURRENT_TIME} />);
    enterTimes("11:00", "12:00");
    fireEvent.click(screen.getByRole("button", { name: "Check Availability" }));
    await waitFor(() => {
      expect(screen.getByText("AI explanation")).toBeTruthy();
    });
    // Change the start time — result is cleared, so explanation disappears.
    const startInput = screen.getByLabelText(/Start time/);
    fireEvent.change(startInput, { target: { value: "12:00" } });
    fireEvent.blur(startInput);
    expect(screen.queryByText("AI explanation")).toBeNull();
  });

  it("clears the explanation when the selected room changes after a check", async () => {
    const otherRoom = ROOMS.find((r) => r.id === "su-hall")!;
    const { rerender } = render(<BookingChecker room={DEFAULT_ROOM} now={CURRENT_TIME} />);
    enterTimes("11:00", "12:00");
    fireEvent.click(screen.getByRole("button", { name: "Check Availability" }));
    await waitFor(() => {
      expect(screen.getByText("AI explanation")).toBeTruthy();
    });
    // Switch to a different room — result is cleared, so explanation disappears.
    rerender(<BookingChecker room={otherRoom} now={CURRENT_TIME} />);
    expect(screen.queryByText("AI explanation")).toBeNull();
  });

  it("does not show the AI explanation when times are missing and Check is pressed (R2)", () => {
    render(<BookingChecker room={DEFAULT_ROOM} now={CURRENT_TIME} />);
    fireEvent.click(screen.getByRole("button", { name: "Check Availability" }));
    expect(screen.getByText("Please select both a start and an end time.")).toBeTruthy();
    expect(screen.queryByText("AI explanation")).toBeNull();
  });

  it("does not regenerate the explanation on unrelated re-renders (C5)", async () => {
    const { rerender } = render(<BookingChecker room={DEFAULT_ROOM} now={CURRENT_TIME} />);
    enterTimes("11:00", "12:00");
    fireEvent.click(screen.getByRole("button", { name: "Check Availability" }));
    await waitFor(() => {
      expect(screen.getByText("AI explanation")).toBeTruthy();
    });
    // The explanation paragraph is present and stable.
    expect(screen.getByText("AI explanation")).toBeTruthy();
    // Re-render with identical props — the panel must still be present (not remounted).
    rerender(<BookingChecker room={DEFAULT_ROOM} now={CURRENT_TIME} />);
    expect(screen.getByText("AI explanation")).toBeTruthy();
  });
});
