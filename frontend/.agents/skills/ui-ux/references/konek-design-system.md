# KONEK design-system rules

Read this file for any visual implementation, theme work, shared primitive, or multi-screen proposal. The aim is one coherent product system for candidate and recruiter experiences, with foundations that can also inform a future React Native app.

## One source of truth

- Maintain one semantic token source for color, typography, spacing, radius, elevation, motion, and layer order.
- Do not keep duplicate theme objects with conflicting palettes. Consolidate or adapt existing theme data behind the single source instead of adding another object.
- Use one theme provider and one persistence key for the web app. Theme initialization must run before first paint where practical, work on direct route navigation, and persist after reload.
- Components consume semantic roles such as `background`, `surface`, `text`, `muted`, `border`, `accent`, `success`, or `danger`. Do not consume scattered palette values.
- Arbitrary hex, RGB, HSL, or named colors do not belong in application components. A temporary migration exception must be documented and tracked to removal.

## Required shared primitives

Use or establish a consistent implementation for:

- Button
- Input
- Select
- Modal
- Drawer
- Card
- Badge
- Tabs
- Table
- EmptyState
- Skeleton
- Toast
- ThemeSwitcher

Inventory the repository first. Extend a suitable existing primitive before creating a parallel one. Preserve its public behavior during refactors, or migrate all call sites within the approved scope.

Each primitive must define its supported variants, sizes, states, keyboard behavior, theme behavior, content limits, and responsive expectations. Visual variants must correspond to a real interaction or semantic role.

## Scales

Keep scales small and documented in the token source.

### Spacing

Use a base scale equivalent to `4, 8, 12, 16, 24, 32, 48, 64`. Add a value only when a recurring layout need cannot be expressed with the scale. Tight internal optical adjustments may use `2` or `6`; do not let them become page-layout spacing.

### Radius

Use four roles at most:

- small: compact controls and small badges;
- medium: inputs, buttons, and rows;
- large: cards, menus, and panels;
- full: pills, avatars, and circular controls.

Nested radii must account for parent padding so curves remain visually concentric.

### Elevation

Reserve shadows for meaningful elevation: popovers, menus, sticky overlays when separation is needed, drawers, and dialogs. Use background and border hierarchy for ordinary cards and tables. Dark-mode elevation needs its own tested values.

## Color and theme behavior

- Apply the palette and surface hierarchy in [the KONEK product profile](konek-product-profile.md).
- Keep one semantic status mapping throughout the product.
- Test every status and interactive state in light and dark mode. Do not assume a token that passes on white also passes on deep navy.
- Use cobalt for focused action and analysis emphasis with restraint. Ice blue supports explanation, selection, and analysis context; it must not flood data-heavy screens.
- Use deep navy instead of pure black in dark mode.
- Color never carries status, selection, or validation meaning alone.

## Typography and data density

- Use Inter and verify Vietnamese glyph rendering.
- Keep body and control text comfortable for long sessions; dense tables may be compact, but controls and row actions must remain operable.
- Use tabular numerals for scores, counts, dates, durations, and aligned metrics.
- Align numeric columns consistently and include units in headings or values.
- Preserve full meaning for candidate names, job titles, file names, and evidence needed to make a decision. Provide a reveal mechanism when truncation is unavoidable.

## Product-screen composition

- Lead each screen with its main task, current context, and the minimum supporting actions.
- Prefer stable, reusable regions: app shell, page header, filters, data view, detail surface, feedback surface.
- For tables and lists, define sorting, filtering, pagination or virtualization expectations from actual data and existing behavior. Do not invent client-side behavior to make a mockup interactive.
- Keep loading, empty, error, success, stale, and long-content behavior part of the component contract.
- Preserve context when opening candidate, job, or resume details. Drawers and modals are appropriate only when the task can finish without losing necessary workspace context.

## Responsive rules

- Design from content priority, not device labels. At narrower widths, preserve the main decision, primary action, status, and an entry point to secondary details.
- A desktop table may become a prioritized list or card-row pattern on small screens. Do not squeeze every column into a horizontally unreadable layout.
- Test exact widths in [the validation checklist](checklist.md) and apply [responsive rules](responsive.md).
- Respect mobile safe areas for fixed headers, bottom actions, drawers, and full-screen overlays.

## Interaction and accessibility evidence

- Use semantic elements before ARIA. Preserve visible labels, programmatic names, predictable focus order, Escape behavior, focus return, and scroll locking for overlays.
- Keyboard navigation must be tested, including menus, tabs, tables with row actions, drawers, and dialogs.
- Focus indicators must be perceptible in both themes. If a legacy reference conflicts with this requirement, this requirement wins for KONEK.
- Test contrast and behavior; do not report accessibility as working based on source inspection or intent.

## 3D boundary

Three-dimensional presentation belongs to document, data, analysis, scanning, matching, and storytelling scenes. Ordinary Button, Input, Select, Table, Tabs, filters, and form controls stay familiar and two-dimensional. A 3D scene may point toward or reveal real product UI, but the product UI itself remains DOM-based and usable without WebGL.
