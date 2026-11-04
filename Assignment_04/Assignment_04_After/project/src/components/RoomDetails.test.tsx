// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import RoomDetails from "@/components/RoomDetails";
import { ROOMS } from "@/data/rooms";

afterEach(cleanup);

const studentUnionHall = ROOMS.find((r) => r.id === "su-hall")!;
const artsStudio = ROOMS.find((r) => r.id === "arts-s1")!;

describe("RoomDetails — selected-room details", () => {
  it("shows the name, building, seat count and open status of an open room", () => {
    render(<RoomDetails room={studentUnionHall} />);
    expect(screen.getByRole("heading", { level: 3, name: "Student Union Hall" })).toBeTruthy();
    expect(screen.getByText("Student Union")).toBeTruthy();
    expect(screen.getByText(/120 seats/)).toBeTruthy();
    expect(screen.getByText("Open")).toBeTruthy();
    expect(screen.queryByText("Blocked")).toBeNull();
  });

  it("lists every piece of equipment as a chip", () => {
    render(<RoomDetails room={studentUnionHall} />);
    for (const item of studentUnionHall.equipment) {
      expect(screen.getByText(item)).toBeTruthy();
    }
  });

  it("shows each existing booking with its label and time range", () => {
    render(<RoomDetails room={studentUnionHall} />);
    expect(screen.getByText("Society Meeting")).toBeTruthy();
    expect(screen.getByText("17:00–18:00")).toBeTruthy();
  });

  it("shows the blocked status and the no-bookings message for a blocked room without bookings", () => {
    render(<RoomDetails room={artsStudio} />);
    expect(screen.getByText("Blocked")).toBeTruthy();
    expect(screen.queryByText("Open")).toBeNull();
    expect(screen.getByText("No existing bookings today.")).toBeTruthy();
  });
});
