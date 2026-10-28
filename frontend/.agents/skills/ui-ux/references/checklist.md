# KONEK UI/UX validation checklist

Run the sections relevant to the selected work mode. Implementation and review require observable evidence; source inspection alone is insufficient for claims about rendering, interaction, accessibility, motion, or performance.

## Scope and product truth

- [ ] The selected mode is clear: audit only, proposal only, implement approved direction, refactor without visual redesign, or review.
- [ ] The requested role, journey, routes, components, themes, and devices are identified.
- [ ] Applicable repository instructions were read and the working tree was checked before edits.
- [ ] Unrelated and pre-existing changes remain intact.
- [ ] Every product claim, capability, AI behavior, customer logo, testimonial, certification, metric, or outcome has an authoritative source.
- [ ] Mock and placeholder content is internally consistent and identified as mock or placeholder.
- [ ] Repository code and real API contracts were used instead of speculative behavior.
- [ ] No route, payload, field meaning, permission, analytics event, persistence behavior, or business rule changed outside the approved scope.

## Architecture and design system

- [ ] There is one semantic token source of truth.
- [ ] There are no duplicate theme objects with conflicting palettes.
- [ ] There is one theme provider and one persistence key.
- [ ] Existing Button, Input, Select, Modal, Drawer, Card, Badge, Tabs, Table, EmptyState, Skeleton, Toast, and ThemeSwitcher primitives were reused or deliberately consolidated.
- [ ] Radius and spacing values come from the documented scales.
- [ ] Shadows communicate actual elevation and are absent from ordinary flat content surfaces.
- [ ] Semantic status colors have consistent meaning and a non-color cue.
- [ ] Inter loads successfully and Vietnamese glyphs render without clipping.
- [ ] No arbitrary hard-coded colors exist outside the token source or a documented migration boundary.
- [ ] No CSS custom property used by the changed UI is undefined in either theme.

Suggested static checks, adapted to repository conventions:

```bash
rg -n "#[0-9A-Fa-f]{3,8}|rgb\(|hsl\(" <changed-ui-paths>
rg -n "var\(--[A-Za-z0-9_-]+" <changed-ui-paths>
rg -n "ThemeProvider|localStorage.*theme|data-theme|classList.*dark" frontend/src
```

Resolve each result; do not assume every match is a defect.

## Content, structure, and states

- [ ] Each route has exactly one visible `<h1>`; nested sections use ordered heading levels.
- [ ] The main task and primary action are clear without relying on animation.
- [ ] Candidate-facing and recruiter-facing language and density follow their distinct needs.
- [ ] Loading, empty, error, success, disabled, stale, and retry states exist where the real flow can produce them.
- [ ] Long names, job titles, file names, descriptions, large numbers, zero values, missing images, and long translated content were tested.
- [ ] Initial loading and subsequent loading are distinguishable when existing behavior requires it.
- [ ] Destructive actions state their consequence and preserve existing confirmation behavior.
- [ ] Analysis, match, score, diagnosis, and suggestion outputs do not imply unsupported certainty.

## Responsive widths

Test the actual route, relevant overlay, and important state at each exact width:

- [ ] **375px:** no page-level horizontal scroll; primary task and row actions remain reachable; touch targets and safe areas work.
- [ ] **768px:** tablet layout uses space deliberately; navigation, filters, tables, drawers, and two-column transitions do not collide.
- [ ] **1024px:** app shell plus open navigation leaves enough room for the main data view; sticky regions and tables remain usable.
- [ ] **1280px:** desktop hierarchy and density are balanced; toolbars fit or wrap intentionally.
- [ ] **1440px:** content does not become sparse or over-wide; long lines and detached actions remain constrained.

At every width:

- [ ] No clipped text, inaccessible off-screen action, overlapping layer, accidental horizontal scroll, or broken sticky boundary exists.
- [ ] Tables either remain readable or change to an intentional prioritized small-screen pattern.
- [ ] Fixed headers, bottom actions, full-screen panels, and dialogs respect `env(safe-area-inset-*)` where relevant.
- [ ] Opening menus, selects, dialogs, and drawers does not push the page or cause layout shift.

## Themes and persistence

- [ ] Light mode matches the approved white/navy/cobalt/ice hierarchy.
- [ ] Dark mode uses deep navy rather than pure black and has a clear page/surface/raised-surface hierarchy.
- [ ] Text, icons, borders, focus, selection, charts, statuses, skeletons, and overlays are readable in both themes.
- [ ] Theme selection persists after reload.
- [ ] Theme selection is correct after direct navigation to every affected route.
- [ ] First paint does not flash the wrong theme when the architecture can prevent it.
- [ ] System-theme changes behave as designed when system mode exists.

## Keyboard and interaction

- [ ] All interactive elements are reachable and operable by keyboard in a logical order.
- [ ] Focus is visibly perceptible in light and dark themes.
- [ ] Tabs, menus, selects, tables with row actions, dialogs, and drawers use expected keyboard behavior.
- [ ] Escape closes dismissible overlays; focus returns to the opener; focus stays contained in modal interactions.
- [ ] Labels and accessible names identify controls without relying on placeholder text or icon shape.
- [ ] Hover-only information is also available to keyboard and touch users.
- [ ] Interactive behavior was tested before it is reported as accessible or working.

## Motion and scroll

- [ ] Durations, properties, springs, hierarchy, and continuous-animation count follow [the motion policy](motion-policy.md).
- [ ] `prefers-reduced-motion: reduce` removes or simplifies motion without hiding content or actions.
- [ ] No React state update runs on every scroll frame.
- [ ] Scroll listeners are passive where appropriate and expensive work is scheduled once per animation frame.
- [ ] Scroll-driven chapters activate predictably in both directions and at direct deep-link positions.
- [ ] Sticky stages enter and release without covering later content.
- [ ] Off-screen and background-tab animations pause.
- [ ] Animations do not introduce cumulative layout shift.
- [ ] Scroll performance was measured on a throttled or representative slow device, not inferred from a development machine.

## WebGL and 3D

- [ ] Every major scene animation maps to a real feature, state change, or user outcome.
- [ ] Essential text, navigation, controls, and calls to action remain in the DOM.
- [ ] WebGL unavailable, context creation failure, and context loss produce a coherent fallback rather than a blank stage.
- [ ] Mobile receives a simplified scene or static fallback when the full composition is unsuitable.
- [ ] Quality tiers, DPR, draw calls, triangles, texture memory, and frame time stay within the chosen budget.
- [ ] Geometry, materials, textures, render targets, observers, and listeners are disposed.
- [ ] Ordinary buttons, inputs, tables, tabs, and filters remain familiar two-dimensional controls.
- [ ] The transition from the story scene to real product UI uses authentic tokens, terminology, states, and capability evidence.

## Runtime and visual verification

For an implemented web route, run the repository checks and the existing probe when possible:

```bash
node <skill-directory>/scripts/probe.mjs http://localhost:<port>/<route> --sweep
```

- [ ] Screenshots at 375, 768, 1024, 1280, and 1440 were inspected, not merely generated.
- [ ] Relevant light and dark states were inspected.
- [ ] Console errors, failed resources, hydration issues, and unhandled promise rejections were checked.
- [ ] Layout shift was observed during load, font swap, image load, theme initialization, and state changes.
- [ ] Slow CPU and network behavior preserves usable loading and fallback states.
- [ ] Probe findings were resolved or each remaining finding is reported with reason and impact.

## Proposal and refactor evidence

- [ ] Proposal artifacts cover hierarchy, real states, responsive behavior, both themes when in scope, and constraints found in the audit.
- [ ] Competing wireframes, when requested, were validated with `scripts/probe.mjs --sweep` when runnable, and screenshots at 375, 768, and 1280 were inspected before presentation.
- [ ] Refactors have before/after visual evidence at the required widths and themes.
- [ ] Refactors preserve routes, copy, interaction, API behavior, analytics, and domain outcomes unless an approved change says otherwise.

## Final report

- [ ] Report the mode, files changed, structural decisions, behavior preserved, and any rules intentionally merged or superseded.
- [ ] List validation commands and their actual results.
- [ ] Identify untested conditions, unavailable environments, placeholders, and unresolved ambiguity.
- [ ] Avoid unverified claims such as “fully responsive,” “fully accessible,” “pixel perfect,” or “production ready.”
