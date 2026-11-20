# AGENTS.md — Smart Campus Room Availability Checker

> Operating instructions for AI coding agents (and human reviewers) working on
> this repository for Software Engineering Assignment #05. Read this file in
> full before making any change. Do not begin work until every constraint below
> is understood.

## 1. Project purpose

A browser-only prototype that helps users find a campus room and check whether a
requested time slot can be booked. No bookings are created, saved, or sent to a
server. The app uses fictional room data and a fixed current time (09:00 /
minute 540) so that availability checks are fully deterministic and
reproducible.

## 2. Architecture

| Layer | Location | Responsibility |
| --- | --- | --- |
| App shell | `src/App.tsx` | Holds top-level state (selected room, filters) and composes the layout. |
| Components | `src/components/` | Presentational and interactive UI. `BookingChecker` owns the time inputs, live preview, and the confirmed result. `ExplainPanel` renders the AI explanation. |
| Domain logic | `src/lib/` | Pure functions for availability rules, overlap detection, time parsing, filters, and the explanation adapter/validator. |
| Fixtures | `src/data/rooms.ts` | The five sample rooms and their existing bookings. Static and frozen. |
| Tests | `src/**/*.test.ts(x)` | Unit, component, and integration tests run by Vitest. |

### Deterministic booking logic (source of truth)

`checkAvailability` in `src/lib/availability.ts` is the canonical availability
decision. It enforces the five booking rules (AC1–AC5) and returns an
`AvailabilityResult` with `kind`, `message`, and `isAvailable`. No other module
may override, reinterpret, or bypass this decision.

### Independent AI explanations

`src/lib/explain.ts` and `src/lib/mockLLM.ts` form a self-contained, optional
explanation adapter that rephrases the deterministic result in plain language.
The adapter:

- Receives the deterministic result as input and may only describe it.
- Never contains an `isAvailable` field in its output (`ExplainOutput`).
- Falls back to deterministic fallback text on any input, output, timeout, or
  API failure — never throws.
- Is guarded by `inventsBookingLabels`, which prevents fabricated booking
  details while tolerating room names that legitimately contain words like
  "study" or "lab".

The explanation panel (`ExplainPanel.tsx`) is visually separated from the result
banner, appears only after a confirmed check, and clears when the room or time
changes.

## 3. Setup

```bash
npm install
```

Requires Node.js 18 or newer and npm.

## 4. Safe commands

| Command | What it does |
| --- | --- |
| `npm test` | Runs the full test suite once (Vitest). |
| `npm run test:watch` | Runs tests and re-runs on file changes. |
| `npm run typecheck` | Checks TypeScript types (`tsc --noEmit`). |
| `npm run lint` | Checks code style and common mistakes (ESLint). |
| `npm run build` | Produces a production build in `dist/`. |

Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` before
considering any change complete. All four must exit 0.

## 5. Coding conventions

- Prefer pure functions and minimal, focused changes.
- Use at most two justified design patterns.
- Do not mutate booking fixtures or any room data at runtime.
- Keep existing validation messages and responsive UI feedback unchanged.
- Avoid unnecessary abstractions, class hierarchies, and speculative
  generalisations.
- Match the conventions of neighbouring files: naming, imports, error handling,
  formatting.
- Reuse existing utilities and types before introducing new ones.
- Add focused regression tests when changing or adding behaviour.

## 6. Testing expectations

- Every change must keep the full suite green. As of this writing: 167 tests
  across 13 files, 0 failures.
- The 112 original booking tests (availability, canBook, time, startTime,
  roomFilters, rooms) must remain unchanged and passing.
- Component tests use `@testing-library/react` and require the
  `// @vitest-environment jsdom` pragma because the Vitest default environment is
  `node` (see `vite.config.ts`).
- New behaviour requires new tests. Do not delete or weaken existing tests to
  make a change pass.
- Do not fabricate test results. Report actual pass/fail counts and any checks
  that could not be executed.

## 7. Allowed actions

- Modifying application source, tests, and configuration within the constraints
  above.
- Adding new tests and improving test coverage.
- Refactoring that preserves all acceptance criteria and keeps all tests green.
- Updating `AGENTS.md` itself (this file) when project conventions evolve.

## 8. Forbidden actions

- Adding a backend, database, login, authentication, or booking creation.
- Changing, adding, removing, or renaming room fixtures in `src/data/rooms.ts`.
- Altering the deterministic booking rules or their exact user-facing messages.
- Allowing the explanation adapter to override, contradict, or bypass the
  deterministic availability result.
- Accessing, reading, or printing secrets, API keys, environment variables, or
  credentials. This project has no secrets and needs none.
- Deploying to production, pushing to remotes, or publishing packages.
- Running destructive commands (`rm -rf`, `git reset --hard`, force-push, dropping
  tables, deleting branches, killing processes).
- Installing new dependencies or changing `package.json` / `package-lock.json`
  without explicit human review and approval.
- Modifying `README.md` unless explicitly asked.
- Fabricating test, build, lint, or typecheck results.

## 9. Human review and approval

- No change is considered complete until a human reviewer has approved it.
- A change is ready for review only when `npm test`, `npm run typecheck`,
  `npm run lint`, and `npm run build` all pass and the reviewer can see the
  actual output.
- Reviewers must verify that:
  - The deterministic booking logic and room fixtures are unchanged.
  - The explanation feature remains optional, non-interfering, and fallback-safe.
  - No secrets, credentials, or environment variables were introduced or
    exposed.
  - No new dependencies were added without approval.
- Merging or deploying requires explicit human approval. Agents must not merge,
  push, deploy, or publish on their own.

## 10. Preservation invariants

The following must remain true after any change:

1. **Deterministic booking logic is the sole source of truth.**
   `checkAvailability` produces the canonical `AvailabilityResult`. The
   explanation adapter may only rephrase it.

2. **Booking rules and messages are unchanged.**
   The five rules (integer minutes 0–1440, start > now, max 120 minutes, blocked
   rooms rejected, overlaps rejected with endpoint touching allowed) and their
   exact messages in `availability.ts` must remain as-is.

3. **Room fixtures remain static.**
   `src/data/rooms.ts` defines exactly five rooms with fixed bookings. No
   production code mutates these arrays.

4. **AI explanations are independent and non-interfering.**
   The explanation panel appears only after a confirmed check, is visually
   separated from the result, never overrides the decision, and fails safely to
   deterministic fallback text.

5. **All four verification commands pass.**
   `npm test`, `npm run build`, `npm run lint`, and `npm run typecheck` must all
   exit 0 with zero errors.
