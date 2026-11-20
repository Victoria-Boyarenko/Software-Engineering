# Smart Campus Room Availability Checker

A prototype that helps users find a campus room and check whether a requested time slot can be booked. Everything runs in the browser; no bookings are created or saved.

## Requirements

- Node.js 18 or newer
- npm (included with Node.js)

## Setup

```bash
npm install
```

## Running the app

```bash
npm run dev
```

Open the local address printed in the terminal to use the app.

## Checks

| Command | What it does |
| --- | --- |
| `npm test` | Runs the test suite once |
| `npm run test:watch` | Runs tests and re-runs them on file changes |
| `npm run typecheck` | Checks TypeScript types |
| `npm run lint` | Checks code style and common mistakes |
| `npm run build` | Produces a production build in `dist/` |

## Booking rules

- Times are entered as HH:MM between 00:00 and 24:00 in one-minute steps.
- A booking must start after the current time, which is fixed at 09:00 for this prototype.
- A booking can last at most 120 minutes.
- Blocked rooms cannot be booked.
- A booking may not overlap an existing one. Ending exactly when another begins is allowed.

## Project layout

- `src/lib/` holds the booking rules and time helpers.
- `src/data/rooms.ts` holds the sample rooms and their existing bookings.
- `src/components/` holds the screen components.
