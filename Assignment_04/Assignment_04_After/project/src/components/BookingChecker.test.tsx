// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
