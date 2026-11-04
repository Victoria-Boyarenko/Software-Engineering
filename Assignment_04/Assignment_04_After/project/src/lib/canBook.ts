// Smart Campus Room Availability Checker
// Pure booking-overlap predicate. Touching at endpoints is allowed (no overlap).
// This function does NOT mutate the input array.

export interface Booking {
  label: string;
  start: number; // minutes after midnight
  end: number; // minutes after midnight
}

// Strict inequalities: intervals that only share an endpoint do not overlap.
export function findConflict(
  existing: Booking[],
  start: number,
  end: number
): Booking | undefined {
  return existing.find((b) => start < b.end && end > b.start);
}

export function canBook(
  existing: Booking[],
  start: number,
  end: number
): boolean {
  return findConflict(existing, start, end) === undefined;
}
