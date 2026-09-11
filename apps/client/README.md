# Mobile client

Expo (SDK 57) + Expo Router + NativeWind. UI-only at this stage: every screen
renders from local mock data, there are no API calls and no auth.

## Running

Requires Node >= 24 (`.nvmrc` at the repo root pins it — run `nvm use`).

```sh
npm install          # from the repo root
npm run dev          # from apps/client — starts Metro
npm run check-types
npm run lint
```

## How styling works

`src/theme/tokens.ts` is the only place design values live. It is transcribed
from `DESIGN.md` and consumed twice: `tailwind.config.ts` turns it into utility
classes, and TS imports it directly for values `className` can't reach (SVG
stroke colours, shadows, animation timings).

Never write a raw hex or pixel value in a component.

Two conventions do most of the work:

- **Composite utilities** replace repeated class clusters — `center` instead of
  `flex items-center justify-center`, plus `row`, `row-between`, `fill`,
  `fill-center`, `absolute-fill`, `gutter`, `tappable`, `hairline-t/-b`. They
  are defined in the `semantics` plugin in `tailwind.config.ts`.
- **`type-*` classes** set font family, size, line height and tracking together,
  one per `DESIGN.md` typography token. Type is never assembled from separate
  classes. Use the `<Text variant="...">` component rather than the class
  directly.

Tailwind only emits classes it finds as **literal strings**, so a template
literal like `` `type-${variant}` `` produces nothing. Components that map a
prop to a class (`Text`, `Badge`, `Button`) spell the classes out in a lookup
object, checked for completeness with `satisfies`.

## Where things live

```
src/theme/       design tokens (single source of truth)
src/types/       domain types, mirroring apps/api/prisma/schema.prisma
src/lib/         pure logic — macros, rolling average, pace, insights, units
src/mocks/       fixtures + a small mutable store
src/hooks/       the only thing screens import for data
src/components/  ui/ primitives · charts/ · home/ · food/ · progress/
src/app/         Expo Router routes
```

## Swapping in the real API

Screens never import from `src/mocks/`. They call hooks in `src/hooks/data.ts`,
which return a TanStack-Query-shaped `{ data, isLoading, error }` plus mutation
callbacks. Replacing the mock store with real requests changes the inside of
those hooks and nothing else.

Domain types in `src/types/domain.ts` match the Prisma schema field-for-field,
including enum members, and dates are ISO strings because that is what the API
sends.

## Demo data

Profile → **Demo data** switches between a populated account and a brand-new
one, so every empty state is reachable without editing fixtures.
