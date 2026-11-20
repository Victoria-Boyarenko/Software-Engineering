import { useMemo, useState } from "react";
import { CURRENT_TIME } from "@/lib/availability";
import { filterRooms, toRoomFilter } from "@/lib/roomFilters";
import { ROOMS } from "@/data/rooms";
import AppHeader from "@/components/AppHeader";
import RoomFinder from "@/components/RoomFinder";
import RoomDetails from "@/components/RoomDetails";
import BookingChecker from "@/components/BookingChecker";

export default function App() {
  const now = CURRENT_TIME;

  const [minCapacity, setMinCapacity] = useState<number | "">("");
  const [requiredEquipment, setRequiredEquipment] = useState<string[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(ROOMS[0].id);

  const matchingRooms = useMemo(
    () => filterRooms(ROOMS, toRoomFilter(minCapacity, requiredEquipment)),
    [minCapacity, requiredEquipment]
  );
  const room = matchingRooms.find((r) => r.id === selectedRoomId) ?? null;

  const applyFilters = (nextCapacity: number | "", nextEquipment: string[]) => {
    const nextMatches = filterRooms(ROOMS, toRoomFilter(nextCapacity, nextEquipment));
    setMinCapacity(nextCapacity);
    setRequiredEquipment(nextEquipment);
    if (!nextMatches.some((r) => r.id === selectedRoomId)) {
      setSelectedRoomId(nextMatches[0]?.id ?? "");
    }
  };

  const toggleEquipment = (item: string) => {
    const next = requiredEquipment.includes(item)
      ? requiredEquipment.filter((i) => i !== item)
      : [...requiredEquipment, item];
    applyFilters(minCapacity, next);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 text-slate-900">
      <AppHeader now={now} />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-6 lg:grid-cols-5">
          <section className="lg:col-span-2 space-y-6">
            <RoomFinder
              minCapacity={minCapacity}
              selectedEquipment={requiredEquipment}
              matchingRooms={matchingRooms}
              selectedRoomId={room?.id ?? null}
              onCapacityChange={(v) => applyFilters(v, requiredEquipment)}
              onToggleEquipment={toggleEquipment}
              onClear={() => applyFilters("", [])}
              onSelect={setSelectedRoomId}
            />
            {room && <RoomDetails room={room} />}
          </section>

          <section className="lg:col-span-3 space-y-6">
            <BookingChecker room={room} now={now} />
          </section>
        </div>

        <footer className="mt-10 text-center text-xs text-slate-400">
          Software Engineering assignment · Prototype v1 · Client-side logic only · No bookings are created
        </footer>
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
