// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import Timeline from "@/components/Timeline";
import { DEFAULT_ROOM } from "@/data/rooms";
import type { RoomConfig } from "@/lib/availability";

afterEach(cleanup);

const roomWithBookings: RoomConfig = DEFAULT_ROOM;
const emptyRoom: RoomConfig = { ...DEFAULT_ROOM, bookings: [] };

describe("Timeline — rendering", () => {
  it("renders the Daily Timeline heading", () => {
    render(<Timeline room={roomWithBookings} result={null} />);
    expect(screen.getByText("Daily Timeline")).toBeTruthy();
  });

  it("renders legend labels for booked and request", () => {
    render(<Timeline room={roomWithBookings} result={null} />);
    expect(screen.getByText("Booked")).toBeTruthy();
    expect(screen.getByText("Your request")).toBeTruthy();
  });

  it("renders all nine tick labels from 00:00 to 24:00", () => {
    render(<Timeline room={roomWithBookings} result={null} />);
    expect(screen.getByText("00:00")).toBeTruthy();
    expect(screen.getByText("03:00")).toBeTruthy();
    expect(screen.getByText("06:00")).toBeTruthy();
    expect(screen.getByText("09:00")).toBeTruthy();
    expect(screen.getByText("12:00")).toBeTruthy();
    expect(screen.getByText("15:00")).toBeTruthy();
    expect(screen.getByText("18:00")).toBeTruthy();
    expect(screen.getByText("21:00")).toBeTruthy();
    expect(screen.getByText("24:00")).toBeTruthy();
  });
});

describe("Timeline — existing bookings", () => {
  it("renders a title attribute for each booking with label and time range", () => {
    render(<Timeline room={roomWithBookings} result={null} />);
    const bookingBar = screen.getByTitle(
      "Data Structures Lecture: 10:00–11:00"
    );
    expect(bookingBar).toBeTruthy();
  });

  it("renders no booking bars when the room has no bookings", () => {
    render(<Timeline room={emptyRoom} result={null} />);
    expect(screen.queryByTitle(/:/)).toBeNull();
  });

  it("renders multiple booking bars for a room with several bookings", () => {
    const multiRoom: RoomConfig = {
      ...DEFAULT_ROOM,
      bookings: [
        { label: "Morning Seminar", start: 540, end: 600 },
        { label: "Afternoon Lab", start: 780, end: 840 },
      ],
    };
    render(<Timeline room={multiRoom} result={null} />);
    expect(screen.getByTitle("Morning Seminar: 09:00–10:00")).toBeTruthy();
    expect(screen.getByTitle("Afternoon Lab: 13:00–14:00")).toBeTruthy();
  });
});

describe("Timeline — requested interval", () => {
  it("does not render the request bar when start and end are undefined", () => {
    const { container } = render(<Timeline room={roomWithBookings} result={null} />);
    const bars = container.querySelectorAll(".bg-blue-500\\/80, .bg-rose-400\\/80");
    expect(bars.length).toBe(0);
  });

  it("does not render the request bar when start >= end (invalid interval)", () => {
    const { container } = render(
      <Timeline room={roomWithBookings} start={660} end={600} result={null} />
    );
    const bars = container.querySelectorAll(".bg-blue-500\\/80, .bg-rose-400\\/80");
    expect(bars.length).toBe(0);
  });

  it("renders the request bar when start < end and result is available", () => {
    const { container } = render(
      <Timeline
        room={roomWithBookings}
        start={700}
        end={760}
        result={{ kind: "available", message: "Available!", isAvailable: true, reasonCode: "available" }}
      />
    );
    const requestBar = container.querySelector(".bg-blue-500\\/80");
    expect(requestBar).toBeTruthy();
  });

  it("renders the request bar when start < end and result is unavailable", () => {
    const { container } = render(
      <Timeline
        room={roomWithBookings}
        start={630}
        end={690}
        result={{ kind: "unavailable", message: "Overlaps", isAvailable: false, reasonCode: "overlap" }}
      />
    );
    const requestBar = container.querySelector(".bg-rose-400\\/80");
    expect(requestBar).toBeTruthy();
  });

  it("renders the request bar when result is null but the interval is valid", () => {
    const { container } = render(
      <Timeline room={roomWithBookings} start={700} end={760} result={null} />
    );
    const bars = container.querySelectorAll(".bg-blue-500\\/80, .bg-rose-400\\/80");
    expect(bars.length).toBe(1);
  });
});
