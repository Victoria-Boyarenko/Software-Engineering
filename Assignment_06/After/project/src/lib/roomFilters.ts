import type { RoomConfig } from "@/lib/availability";

export interface RoomFilter {
  minCapacity?: number;
  requiredEquipment: readonly string[];
}

export function toRoomFilter(minCapacity: number | "", requiredEquipment: readonly string[]): RoomFilter {
  return { minCapacity: minCapacity === "" ? undefined : minCapacity, requiredEquipment };
}

export function filterRooms(rooms: readonly RoomConfig[], filter: RoomFilter): RoomConfig[] {
  return rooms.filter(
    (room) =>
      (filter.minCapacity === undefined || room.capacity >= filter.minCapacity) &&
      filter.requiredEquipment.every((item) => room.equipment.includes(item))
  );
}
