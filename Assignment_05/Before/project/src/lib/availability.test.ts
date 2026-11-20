import { describe, it, expect } from "vitest";
import { checkAvailability, CURRENT_TIME, type RoomConfig } from "./availability";
import { DEFAULT_ROOM } from "@/data/rooms";

const emptyRoom: RoomConfig = { ...DEFAULT_ROOM, bookings: [] };
const blockedRoom: RoomConfig = { ...DEFAULT_ROOM, blocked: true, bookings: [] };

describe("checkAvailability — AC1 invalid or past times", () => {
  it("rejects non-integer minutes", () => {
    const r = checkAvailability(600.5, 660, emptyRoom);
    expect(r.kind).toBe("unavailable");
    expect(r.message).toBe("Start and end times must be whole minutes.");
  });

  it("rejects start below 00:00", () => {
    const r = checkAvailability(-30, 60, emptyRoom, -60);
    expect(r.message).toBe("Times must be between 00:00 and 24:00 (0–1440 minutes).");
  });

  it("rejects end above 24:00", () => {
    const r = checkAvailability(1380, 1441, emptyRoom);
    expect(r.message).toBe("Times must be between 00:00 and 24:00 (0–1440 minutes).");
  });

  it("rejects end not later than start", () => {
    const r = checkAvailability(660, 600, emptyRoom);
    expect(r.message).toBe("The end time must be later than the start time.");
  });

  it("rejects a start equal to the end time", () => {
    const r = checkAvailability(600, 600, emptyRoom);
    expect(r.kind).toBe("unavailable");
    expect(r.message).toBe("The end time must be later than the start time.");
  });

  it("rejects a start earlier than the current time", () => {
    const r = checkAvailability(500, 600, emptyRoom);
    expect(r.kind).toBe("unavailable");
    expect(r.message).toBe("The start time must be later than the current time (09:00).");
  });

  it("rejects a start equal to the current time", () => {
    const r = checkAvailability(CURRENT_TIME, 600, emptyRoom);
    expect(r.isAvailable).toBe(false);
    expect(r.message).toBe("The start time must be later than the current time (09:00).");
  });

  it("accepts an end of exactly 24:00", () => {
    const r = checkAvailability(1380, 1440, emptyRoom);
    expect(r.kind).toBe("available");
    expect(r.message).toBe("Available! Engineering Hall, Room 204 is free from 23:00 to 24:00 (1 hour).");
  });

  it("accepts a start one minute after the current time", () => {
    expect(checkAvailability(CURRENT_TIME + 1, 600, emptyRoom).kind).toBe("available");
  });

  it("accepts a start of 00:00 when the current time is before the day begins", () => {
    expect(checkAvailability(0, 60, emptyRoom, -1).kind).toBe("available");
  });
});

describe("checkAvailability — AC2 maximum duration 120 minutes", () => {
  it("rejects a 121-minute booking", () => {
    const r = checkAvailability(600, 721, emptyRoom);
    expect(r.kind).toBe("unavailable");
    expect(r.message).toBe("Booking duration is 121 minutes. The maximum is 120 minutes.");
  });

  it("accepts exactly 120 minutes", () => {
    const r = checkAvailability(600, 720, emptyRoom);
    expect(r.kind).toBe("available");
    expect(r.message).toBe("Available! Engineering Hall, Room 204 is free from 10:00 to 12:00 (2 hours).");
  });

  it("accepts exactly 120 minutes ending at the end of the day", () => {
    expect(checkAvailability(1320, 1440, emptyRoom).kind).toBe("available");
  });
});

describe("checkAvailability — AC3 blocked rooms", () => {
  it("rejects any booking in a blocked room", () => {
    const r = checkAvailability(780, 840, blockedRoom);
    expect(r.kind).toBe("unavailable");
    expect(r.message).toBe("This room is currently blocked and cannot be booked.");
  });

  it("reports the blocked state before checking overlaps", () => {
    const r = checkAvailability(610, 650, { ...DEFAULT_ROOM, blocked: true });
    expect(r.message).toBe("This room is currently blocked and cannot be booked.");
  });

  it("rejects every valid one-hour slot across the day in a blocked room", () => {
    for (let start = CURRENT_TIME + 1; start + 60 <= 1440; start += 60) {
      const r = checkAvailability(start, start + 60, blockedRoom);
      expect(r.isAvailable, `slot starting at ${start}`).toBe(false);
    }
  });
});

describe("checkAvailability — AC4 overlaps, touching endpoints allowed", () => {
  it("rejects an overlap and names the conflicting booking", () => {
    const r = checkAvailability(630, 690, DEFAULT_ROOM);
    expect(r.kind).toBe("unavailable");
    expect(r.message).toBe(
      "Overlaps with an existing booking: Data Structures Lecture (10:00–11:00)."
    );
  });

  it("allows a booking that ends exactly when an existing one starts", () => {
    const r = checkAvailability(570, 600, DEFAULT_ROOM);
    expect(r.kind).toBe("available");
    expect(r.message).toBe("Available! Engineering Hall, Room 204 is free from 09:30 to 10:00 (30 minutes).");
  });

  it("allows a booking that starts exactly when an existing one ends", () => {
    const r = checkAvailability(660, 690, DEFAULT_ROOM);
    expect(r.kind).toBe("available");
  });

  it("rejects a one-minute overlap at either end of a booking", () => {
    expect(checkAvailability(659, 700, DEFAULT_ROOM).isAvailable).toBe(false);
    expect(checkAvailability(590, 601, DEFAULT_ROOM).isAvailable).toBe(false);
  });

  it("rejects a request that fully contains an existing booking", () => {
    const r = checkAvailability(590, 700, DEFAULT_ROOM);
    expect(r.kind).toBe("unavailable");
    expect(r.message).toBe(
      "Overlaps with an existing booking: Data Structures Lecture (10:00–11:00)."
    );
  });

  it("rejects a request fully inside an existing booking", () => {
    const r = checkAvailability(610, 620, DEFAULT_ROOM);
    expect(r.kind).toBe("unavailable");
    expect(r.message).toBe(
      "Overlaps with an existing booking: Data Structures Lecture (10:00–11:00)."
    );
  });

  it("names the conflicting booking when it is not the first one in the room", () => {
    const room: RoomConfig = {
      ...DEFAULT_ROOM,
      bookings: [
        { label: "Morning Seminar", start: 600, end: 660 },
        { label: "Afternoon Lab", start: 780, end: 840 },
      ],
    };
    const r = checkAvailability(800, 810, room);
    expect(r.message).toBe("Overlaps with an existing booking: Afternoon Lab (13:00–14:00).");
  });
});

describe("checkAvailability — AC5 original booking data is not modified", () => {
  it("leaves the room's bookings unchanged after checks", () => {
    const room: RoomConfig = {
      ...DEFAULT_ROOM,
      bookings: [{ label: "Lab", start: 600, end: 660 }],
    };
    const snapshot = JSON.stringify(room.bookings);
    checkAvailability(630, 690, room);
    checkAvailability(660, 690, room);
    checkAvailability(700, 800, room);
    expect(JSON.stringify(room.bookings)).toBe(snapshot);
  });
});

describe("checkAvailability — AC6 user-facing result shape", () => {
  it("returns a kind, message, and isAvailable flag consistent with each other", () => {
    const available = checkAvailability(700, 760, emptyRoom);
    expect(available).toMatchObject({ kind: "available", isAvailable: true });
    expect(available.message.length).toBeGreaterThan(0);

    const unavailable = checkAvailability(630, 690, DEFAULT_ROOM);
    expect(unavailable).toMatchObject({ kind: "unavailable", isAvailable: false });
    expect(unavailable.message.length).toBeGreaterThan(0);
  });
});
