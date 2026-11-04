import { EQUIPMENT_OPTIONS, ROOMS } from "@/data/rooms";
import type { RoomConfig } from "@/lib/availability";
import RoomFilters from "@/components/RoomFilters";
import RoomList from "@/components/RoomList";

interface RoomFinderProps {
  minCapacity: number | "";
  selectedEquipment: string[];
  matchingRooms: RoomConfig[];
  selectedRoomId: string | null;
  onCapacityChange: (value: number | "") => void;
  onToggleEquipment: (item: string) => void;
  onClear: () => void;
  onSelect: (id: string) => void;
}

export default function RoomFinder({
  minCapacity,
  selectedEquipment,
  matchingRooms,
  selectedRoomId,
  onCapacityChange,
  onToggleEquipment,
  onClear,
  onSelect,
}: RoomFinderProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-bold text-slate-900">Find a Room</h2>
      <RoomFilters
        minCapacity={minCapacity}
        selectedEquipment={selectedEquipment}
        equipmentOptions={EQUIPMENT_OPTIONS}
        onCapacityChange={onCapacityChange}
        onToggleEquipment={onToggleEquipment}
        onClear={onClear}
      />
      <div className="mt-6 border-t border-slate-100 pt-5">
        <RoomList
          rooms={matchingRooms}
          totalCount={ROOMS.length}
          selectedRoomId={selectedRoomId}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}
