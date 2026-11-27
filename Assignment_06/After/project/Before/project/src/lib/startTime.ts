// Shared AC1 rule: a booking may only start strictly after the current time.
export function isStartAfterNow(start: number, now: number): boolean {
  return start > now;
}
