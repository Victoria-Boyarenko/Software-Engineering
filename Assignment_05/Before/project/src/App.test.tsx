// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import App from "@/App";

afterEach(cleanup);

function enterSlot(start: string, end: string) {
  for (const [label, value] of [
    [/Start time/, start],
    [/End time/, end],
  ] as const) {
    const input = screen.getByLabelText(label);
    fireEvent.change(input, { target: { value } });
    fireEvent.blur(input);
  }
}

function checkAvailability() {
  fireEvent.click(screen.getByRole("button", { name: "Check Availability" }));
}

function selectRoom(name: RegExp) {
  fireEvent.click(screen.getByRole("button", { name }));
}

describe("App — room switching", () => {
  it("replaces the bookings and timeline and clears the previous result when another room is selected", () => {
    render(<App />);

    enterSlot("11:00", "12:00");
    checkAvailability();
    expect(screen.getByText(/Available! Engineering Hall, Room 204/)).toBeTruthy();

    selectRoom(/Library Study Pod B2/);

    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: "Library Study Pod B2" })).toBeTruthy();
    expect(screen.getByText("Group Study: Thesis Review")).toBeTruthy();
    expect(screen.queryByText("Data Structures Lecture")).toBeNull();
    expect(screen.getByTitle("Group Study: Thesis Review: 13:00–14:00")).toBeTruthy();
    expect(screen.queryByTitle("Data Structures Lecture: 10:00–11:00")).toBeNull();
  });

  it("checks the time against the newly selected room", () => {
    render(<App />);

    selectRoom(/Library Study Pod B2/);
    enterSlot("11:00", "12:00");
    checkAvailability();
    expect(screen.getByText(/Available! Library Study Pod B2 is free from 11:00 to 12:00/)).toBeTruthy();

    selectRoom(/Engineering Hall/);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("reports a blocked room as unavailable even for a free slot", () => {
    render(<App />);

    selectRoom(/Arts Block Studio 1/);
    enterSlot("11:00", "12:00");
    checkAvailability();

    expect(screen.getByText("This room is currently blocked and cannot be booked.")).toBeTruthy();
    expect(screen.queryByText(/^Available!/)).toBeNull();
  });

  it("moves the selection to a matching room and clears the result when a filter removes the selected room", () => {
    render(<App />);

    enterSlot("11:00", "12:00");
    checkAvailability();
    expect(screen.getByText(/Available! Engineering Hall, Room 204/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Video Conferencing" }));

    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: "Library Study Pod B2" })).toBeTruthy();
  });
});

describe("App — filter empty state", () => {
  it("shows the empty state and no selected room when no room matches, then recovers after clearing filters", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/Minimum capacity/), { target: { value: "500" } });

    expect(screen.getByText("No rooms match these filters")).toBeTruthy();
    expect(screen.getByText(/No room is selected/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Check Availability" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(screen.queryByText("No rooms match these filters")).toBeNull();
    expect(screen.getByRole("button", { name: /Library Study Pod B2/ })).toBeTruthy();
  });

  it("selects the first matching room again after clearing filters that left no room selected", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/Minimum capacity/), { target: { value: "500" } });
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));

    expect(screen.queryByText(/No room is selected/)).toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: "Engineering Hall, Room 204" })).toBeTruthy();
  });
});
