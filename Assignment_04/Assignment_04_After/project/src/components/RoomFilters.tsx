import { Check, X } from "lucide-react";

interface RoomFiltersProps {
  minCapacity: number | "";
  selectedEquipment: string[];
  equipmentOptions: readonly string[];
  onCapacityChange: (value: number | "") => void;
  onToggleEquipment: (item: string) => void;
  onClear: () => void;
}

export default function RoomFilters({
  minCapacity,
  selectedEquipment,
  equipmentOptions,
  onCapacityChange,
  onToggleEquipment,
  onClear,
}: RoomFiltersProps) {
  const hasFilters = minCapacity !== "" || selectedEquipment.length > 0;

  const handleCapacity = (raw: string) => {
    const n = Number(raw);
    onCapacityChange(raw === "" || !Number.isInteger(n) || n < 1 ? "" : n);
  };

  return (
    <div className="space-y-5">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-slate-700">Minimum capacity</span>
        <input
          type="number"
          min={1}
          inputMode="numeric"
          placeholder="Any"
          value={minCapacity}
          onChange={(e) => handleCapacity(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-semibold text-slate-700">Required equipment</legend>
        <div className="flex flex-wrap gap-2">
          {equipmentOptions.map((item) => {
            const selected = selectedEquipment.includes(item);
            return (
              <button
                key={item}
                type="button"
                aria-pressed={selected}
                onClick={() => onToggleEquipment(item)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-[0.97] ${
                  selected
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                    : "border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                {selected && <Check className="h-3.5 w-3.5" />}
                {item}
              </button>
            );
          })}
        </div>
      </fieldset>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          <X className="h-4 w-4" />
          Clear filters
        </button>
      )}
    </div>
  );
}
