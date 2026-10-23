# timer reviewer notes

## Architecture
This is a Vite React 18 + TypeScript widget gallery; `src/App.tsx` discovers widgets dynamically from `src/components`, `src/editors`, `src/dialogs`, `src/charts`, `src/filters`, `src/stats`, and `src/views`. Widgets are lazy-loaded, independently wrapped in `Suspense` and `WidgetErrorBoundary`, then filtered and paginated in the gallery shell. Shared reusable controls live under `src/ui`, while chart widgets are self-contained SVG components.

## Conventions
- Use strict TypeScript and satisfy the compiler’s `noUnusedLocals`/`noUnusedParameters` rules; `tsconfig.json` enables `strict`, `isolatedModules`, and `noEmit`.
- Gallery-discovered widgets must be `.tsx` files in one of the globbed directories and must export a default React component; otherwise `src/App.tsx` throws `does not export a default component`.
- Components commonly provide both named exports for types/helpers and a default component export, as in `src/charts/AccountChart.tsx` (`AccountPoint`, `AccountChartProps`, `generateAccountSeries`, and `default AccountChart`).
- Chart APIs use typed `{ label, value }` point records, optional `title`, `data`, `width`, and `height`, and a `"bar" | "line"` mode. `AccountChart.tsx` and the other chart files are the representative pattern.
- Prefer React hooks for derived values and local interaction state: charts use `useMemo` for series, maxima, and SVG paths, and `useState` for mode and hover state.
- Buttons explicitly use `type="button"` unless they are intended to submit a form. This is required by the shared UI guidance in `src/ui/README.md`.
- Shared UI components should be imported from `src/ui` with a relative path and reused rather than replaced with new one-off controls; controlled component state remains in the consuming widget (`src/ui/README.md`).
- Accessibility is part of the existing pattern: labels are connected with `htmlFor`, loading uses `role="status"`, widget failures use `role="alert"`, and charts expose `role="img"` with `aria-label` (`src/App.tsx`, `src/charts/AccountChart.tsx`).
- Run `npm run build`; it performs TypeScript checking followed by `vite build` (`package.json`, `src/ui/README.md`).

## Intentional non-standard choices
- Chart implementations are deliberately duplicated across many domain-named files (`src/charts/AccountChart.tsx`, `AlbumChart.tsx`, `AlertChart.tsx`, etc.) rather than sharing a generic chart component. Preserve each widget’s distinct type names, seed, default point count, CSS class, and initial mode.
- The app intentionally uses inline styles in `src/App.tsx`; the repository has no styling dependency or stylesheet requirement.
- Chart demo data is deterministic pseudo-random data generated locally, not runtime-random or fetched from an API.

## Watch out for
- Do not add a gallery widget without a default export, or place it outside the directories listed in `src/App.tsx`; it will not be discovered or will fail at render time.
- Preserve stable keys for repeated chart marks and UI items. Chart marks currently use `p.label`; shared UI guidance requires unique select values and definition-list item IDs.
- Check chart changes with empty or unusually small `data`, and with dimensions below the default: `src/charts/*Chart.tsx` calculates geometry directly from `width`, `height`, and `series`.
- Avoid making hover-only chart information the sole way to understand values; the current SVG exposes an accessible label but point details appear only on mouse hover.
- Keep pagination synchronized with filtering: `App.tsx` resets to page 1 when `query` changes and clamps the displayed page to `pageCount`.