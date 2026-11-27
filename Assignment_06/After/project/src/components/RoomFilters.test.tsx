// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import RoomFilters from "@/components/RoomFilters";
import { EQUIPMENT_OPTIONS } from "@/data/rooms";

afterEach(cleanup);

function renderFilters(overrides: Partial<React.ComponentProps<typeof RoomFilters>> = {}) {
  const onCapacityChange = vi.fn();
  const onToggleEquipment = vi.fn();
  const onClear = vi.fn();
  render(
    <RoomFilters
      minCapacity=""
      selectedEquipment={[]}
      equipmentOptions={EQUIPMENT_OPTIONS}
      onCapacityChange={onCapacityChange}
      onToggleEquipment={onToggleEquipment}
      onClear={onClear}
      {...overrides}
    />
  );
  return { onCapacityChange, onToggleEquipment, onClear };
}

describe("RoomFilters — capacity input", () => {
  it("renders the capacity input with placeholder Any", () => {
    renderFilters();
    expect(screen.getByPlaceholderText("Any")).toBeTruthy();
  });

  it("calls onCapacityChange with a positive integer", () => {
    const { onCapacityChange } = renderFilters();
    fireEvent.change(screen.getByPlaceholderText("Any"), { target: { value: "30" } });
    expect(onCapacityChange).toHaveBeenCalledWith(30);
  });

  it("calls onCapacityChange with empty string for zero", () => {
    const { onCapacityChange } = renderFilters();
    fireEvent.change(screen.getByPlaceholderText("Any"), { target: { value: "0" } });
    expect(onCapacityChange).toHaveBeenCalledWith("");
  });

  it("calls onCapacityChange with empty string for negative values", () => {
    const { onCapacityChange } = renderFilters();
    fireEvent.change(screen.getByPlaceholderText("Any"), { target: { value: "-5" } });
    expect(onCapacityChange).toHaveBeenCalledWith("");
  });

  it("calls onCapacityChange with empty string for non-integer input", () => {
    const { onCapacityChange } = renderFilters({ minCapacity: 20 });
    fireEvent.change(screen.getByPlaceholderText("Any"), { target: { value: "abc" } });
    expect(onCapacityChange).toHaveBeenCalledWith("");
  });

  it("calls onCapacityChange with empty string when the field is cleared", () => {
    const { onCapacityChange } = renderFilters({ minCapacity: 20 });
    fireEvent.change(screen.getByPlaceholderText("Any"), { target: { value: "" } });
    expect(onCapacityChange).toHaveBeenCalledWith("");
  });
});

describe("RoomFilters — equipment toggle buttons", () => {
  it("renders a button for each equipment option", () => {
    renderFilters();
    for (const item of EQUIPMENT_OPTIONS) {
      expect(screen.getByRole("button", { name: item })).toBeTruthy();
    }
  });

  it("marks selected equipment with aria-pressed true", () => {
    renderFilters({ selectedEquipment: ["Projector"] });
    const btn = screen.getByRole("button", { name: "Projector" });
    expect(btn.getAttribute("aria-pressed")).toBe("true");
  });

  it("marks unselected equipment with aria-pressed false", () => {
    renderFilters({ selectedEquipment: ["Projector"] });
    const btn = screen.getByRole("button", { name: "Whiteboard" });
    expect(btn.getAttribute("aria-pressed")).toBe("false");
  });

  it("calls onToggleEquipment with the item name when clicked", () => {
    const { onToggleEquipment } = renderFilters();
    fireEvent.click(screen.getByRole("button", { name: "Lab Computers" }));
    expect(onToggleEquipment).toHaveBeenCalledWith("Lab Computers");
  });
});

describe("RoomFilters — clear button visibility", () => {
  it("does not show Clear filters when no filters are active", () => {
    renderFilters();
    expect(screen.queryByText("Clear filters")).toBeNull();
  });

  it("shows Clear filters when a capacity is set", () => {
    renderFilters({ minCapacity: 20 });
    expect(screen.getByText("Clear filters")).toBeTruthy();
  });

  it("shows Clear filters when equipment is selected", () => {
    renderFilters({ selectedEquipment: ["Projector"] });
    expect(screen.getByText("Clear filters")).toBeTruthy();
  });

  it("calls onClear when the Clear filters button is clicked", () => {
    const { onClear } = renderFilters({ minCapacity: 20 });
    fireEvent.click(screen.getByText("Clear filters"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
