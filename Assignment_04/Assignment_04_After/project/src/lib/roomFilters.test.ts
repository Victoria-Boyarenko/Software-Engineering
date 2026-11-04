import { describe, it, expect } from "vitest";
import type { RoomConfig } from "@/lib/availability";
import { DEFAULT_ROOM, ROOMS } from "@/data/rooms";
import { filterRooms } from "./roomFilters";

function makeRoom(overrides: Partial<RoomConfig> & { id: string }): RoomConfig {
  return { ...DEFAULT_ROOM, name: overrides.id, bookings: [], ...overrides };
}

const rooms: RoomConfig[] = [
  makeRoom({ id: "small", capacity: 6, equipment: ["Whiteboard"] }),
  makeRoom({ id: "medium", capacity: 20, equipment: ["Projector", "Whiteboard"] }),
  makeRoom({ id: "large", capacity: 120, equipment: ["Projector", "Video Conferencing", "Sound System"] }),
  makeRoom({ id: "blocked-medium", capacity: 20, equipment: ["Projector"], blocked: true }),
];

const ids = (list: RoomConfig[]) => list.map((r) => r.id);

describe("F1 — minimum capacity", () => {
  it("excludes rooms smaller than the minimum", () => {
    expect(ids(filterRooms(rooms, { minCapacity: 10, requiredEquipment: [] }))).toEqual([
      "medium",
      "large",
      "blocked-medium",
    ]);
  });

  it("includes a room whose capacity equals the minimum exactly", () => {
    expect(ids(filterRooms(rooms, { minCapacity: 20, requiredEquipment: [] }))).toContain("medium");
  });

  it("excludes a room one seat below the minimum", () => {
    expect(ids(filterRooms(rooms, { minCapacity: 21, requiredEquipment: [] }))).toEqual(["large"]);
  });
});

describe("F2 — required equipment must all be present", () => {
  it("excludes a room missing a single required item", () => {
    expect(ids(filterRooms(rooms, { requiredEquipment: ["Video Conferencing"] }))).toEqual(["large"]);
  });

  it("excludes rooms that have none of the required items", () => {
    expect(ids(filterRooms(rooms, { requiredEquipment: ["Lab Computers"] }))).toEqual([]);
  });
});

describe("F3 — every selected equipment item is required (AND, not OR)", () => {
  it("excludes a room that has only one of two required items", () => {
    expect(ids(filterRooms(rooms, { requiredEquipment: ["Projector", "Whiteboard"] }))).toEqual([
      "medium",
    ]);
  });

  it("includes a room that has the required items plus extras", () => {
    expect(
      ids(filterRooms(rooms, { requiredEquipment: ["Projector", "Sound System"] }))
    ).toEqual(["large"]);
  });

  it("includes a room only when it has all three of three required items", () => {
    expect(
      ids(filterRooms(rooms, { requiredEquipment: ["Projector", "Video Conferencing", "Sound System"] }))
    ).toEqual(["large"]);
  });

  it("excludes a room that has two of three required items", () => {
    expect(
      filterRooms(rooms, { requiredEquipment: ["Projector", "Whiteboard", "Video Conferencing"] })
    ).toEqual([]);
  });
});

describe("F4 — no filter selected means no restriction", () => {
  it("returns every room in original order when no filters are set", () => {
    expect(ids(filterRooms(rooms, { requiredEquipment: [] }))).toEqual(ids(rooms));
  });

  it("treats a minimum capacity of undefined as no capacity restriction", () => {
    expect(ids(filterRooms(rooms, { minCapacity: undefined, requiredEquipment: [] }))).toHaveLength(4);
  });

  it("includes the real library pod at exactly its capacity of 6", () => {
    expect(ids(filterRooms(ROOMS, { minCapacity: 6, requiredEquipment: [] }))).toContain("lib-b2");
    expect(ids(filterRooms(ROOMS, { minCapacity: 7, requiredEquipment: [] }))).not.toContain("lib-b2");
  });

  it("treats a minimum capacity of 1 as including every room", () => {
    expect(ids(filterRooms(rooms, { minCapacity: 1, requiredEquipment: [] }))).toHaveLength(4);
  });

  it("keeps blocked rooms in the matching list so users can see them", () => {
    expect(ids(filterRooms(rooms, { requiredEquipment: ["Projector"] }))).toContain("blocked-medium");
  });
});

describe("F5 — no matches returns an empty list", () => {
  it("returns an empty array when capacity exceeds every room", () => {
    expect(filterRooms(rooms, { minCapacity: 500, requiredEquipment: [] })).toEqual([]);
  });

  it("returns an empty array when capacity and equipment together match nothing", () => {
    expect(
      filterRooms(rooms, { minCapacity: 50, requiredEquipment: ["Whiteboard"] })
    ).toEqual([]);
  });

  it("returns an empty array for an empty input list", () => {
    expect(filterRooms([], { minCapacity: 1, requiredEquipment: [] })).toEqual([]);
  });
});

describe("filters combine and never mutate input", () => {
  it("applies capacity and equipment together (AND)", () => {
    expect(
      ids(filterRooms(rooms, { minCapacity: 20, requiredEquipment: ["Projector"] }))
    ).toEqual(["medium", "large", "blocked-medium"]);
  });

  it("does not modify the rooms array or its equipment lists", () => {
    const snapshot = JSON.stringify(rooms);
    filterRooms(rooms, { minCapacity: 10, requiredEquipment: ["Projector"] });
    expect(JSON.stringify(rooms)).toBe(snapshot);
  });
});
