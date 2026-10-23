# timer reviewer notes

## Architecture

This is a Vite + React 18 + TypeScript application using native browser/React APIs and no runtime packages beyond React. `src/App.tsx` acts as a large application/gallery composition root, importing domain widgets from `src/components`, editors from `src/editors`, views from `src/views`, and charts from `src/charts`. Reusable primitives live in `src/ui`; the shared UI documentation describes them as components consumed by widgets rather than standalone gallery entries.

## Conventions

- Use strict TypeScript: `tsconfig.json` enables `strict`, `noUnusedLocals`, `noUnusedParameters`, `isolatedModules`, and `noEmit`. New code must type-check via `npm run build`.
- Components use named exports and commonly also provide a default export. For example, `src/charts/AccountChart.tsx` exports both `AccountChart` and `default AccountChart`.
- Domain-specific files follow a predictable naming scheme: `OrderCard`, `OrderEditor`, `OrderGrid`, and corresponding files under `src/components`, `src/editors`, and `src/views` (`src/App.tsx`).
- Chart modules expose domain-specific point interfaces, mode unions, props, and deterministic generators. For example, `src/charts/AccountChart.tsx` defines `AccountPoint`, `AccountChartMode`, `AccountChartProps`, and `generateAccountSeries`.
- Charts use React state for display mode and hover state, `useMemo` for derived series/path/max values, and native inline SVG (`src/charts/AccountChart.tsx`, `src/charts/AlbumChart.tsx`).
- Shared UI controls are intended to be controlled by the consuming widget. Keep state outside `SearchInput`, `TextField`, pagination, toggles, and similar primitives (`src/ui/README.md`).
- Use native semantics and attributes supplied by shared components. Buttons default to `type="button"`; set `type="submit"` explicitly when submitting a form (`src/ui/README.md`).
- Select option values and definition-list item IDs must be unique; status badges must include wording rather than relying only on color (`src/ui/README.md`).
- Import local modules with relative paths, including shared UI imports such as `../ui` (`src/ui/README.md`).

## Intentional non-standard choices

- The repository contains many highly repetitive, domain-specific components and charts rather than consolidating them into generic components. This appears to be deliberate gallery/widget coverage; do not flag duplication alone (`src/App.tsx`, `src/charts/AccountChart.tsx`, `src/charts/AlbumChart.tsx`).
- Chart sample data is generated locally with a deterministic seeded formula instead of randomness or a data library (`src/charts/AccountChart.tsx`).
- Charts use inline SVG and hard-coded presentation colors, with no charting dependency or stylesheet requirement (`src/charts/AccountChart.tsx`, `src/ui/README.md`).
- `src/App.tsx` intentionally has a very large import/composition surface because it registers the application’s many widgets, editors, views, and charts.

## Watch out for

- Preserve controlled-component behavior: do not add internal state that conflicts with the consuming widget’s `value`/`onChange` contract (`src/ui/README.md`).
- Flag missing accessible labels, headings, status wording, or form associations when adding UI. Hover-only chart details in `src/charts/*.tsx` should not become the sole way to access data.
- Check chart geometry when changing `width`, `height`, or data handling: calculations assume usable dimensions and use labels as SVG keys (`src/charts/AccountChart.tsx`).
- Flag accidental nondeterminism or changing generator seeds, since chart fixtures currently produce stable output (`src/charts/AccountChart.tsx`, `src/charts/AlbumChart.tsx`).
- Avoid introducing dependencies or stylesheets for shared UI without a clear architectural reason; the documented component set requires neither (`src/ui/README.md`).