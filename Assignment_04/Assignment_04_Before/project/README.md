# Smart Campus Room Availability Checker

Software Engineering — Assignment #04. React, TypeScript and Vite application using fictional room and booking data.

## Requirements
- Node.js and npm (a recent supported Node.js LTS release is recommended).

## Setup
From the `project` directory:

```bash
npm ci
```

## Run locally
```bash
npm run dev
```
Open the local URL printed by Vite.

## Run automated tests
```bash
npm test -- --run
```
`npm test` also runs the Vitest suite once. For interactive watch mode, use `npm run test:watch`.

## Type checking and production build
```bash
npm run typecheck
npm run build
```
Optional preview of the build: `npm run preview`.

## Project structure
- `src/data/rooms.ts`: five fictional rooms and their bookings.
- `src/lib/availability.ts`, `canBook.ts`, `roomFilters.ts`, `time.ts`: booking rules, overlap detection, filters and time helpers.
- `src/components/`: reusable UI components.
- `src/**/*.test.ts` and `src/**/*.test.tsx`: automated unit and UI tests.

## Recorded verification
The submitted report documents an independent final Vitest run with 103 passing tests in 9 files, followed by successful TypeScript type checking and a production build. These are recorded results, not a claim that the commands were rerun when this README was written.

## Limitations
The room data and current time are fixed; no authentication, persistence, database or live API is included. UI tests run using jsdom rather than a real browser.
