// Smart Campus Room Availability Checker
// Pure booking-overlap predicate. Touching at endpoints is allowed (no overlap).
// This function does NOT mutate the input array.

export interface Booking {
  label: string;
  start: number; // minutes after midnight
  end: number; // minutes after midnight
}

/**
 * Returns true if a proposed [start, end) interval can be booked alongside
 * the existing bookings (no overlap). Touching at endpoints is allowed:
 * a booking that ends at 660 and a new one starting at 660 do NOT overlap.
 */
export function canBook(
  existing: Booking[],
  start: number,
  end: number
): boolean {
  // Overlap occurs only when the intervals intersect by a positive amount.
  // Using strict inequalities means shared endpoints are not overlaps.
  return !existing.some((b) => start < b.end && end > b.start);
}
