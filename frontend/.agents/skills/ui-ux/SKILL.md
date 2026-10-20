---
name: ui-ux
description: Audit, propose, implement, refactor, or review KONEK interfaces, including data-heavy candidate and recruiter screens, marketing pages, scroll storytelling, React Three Fiber scenes, themes, responsive web behavior, and future React Native alignment. Use for UI/UX work in this repository; do not use for backend-only changes.
---

# KONEK UI/UX workflow

Use this skill for KONEK product UI, landing pages, design-system work, motion, responsive behavior, and UI reviews. The approved direction is **KONEK Career Signal**: a resume is a career signal decoded into useful evidence by an analysis engine. The experience must feel precise, trustworthy, technical, modern, premium, and restrained.

This skill governs UI decisions and workflow. It does not authorize backend changes, new product behavior, new dependencies, publishing, or changes outside the user's requested scope.

## Select the work mode

Choose the mode from the request before proposing or editing. A direct request to implement a defined direction counts as approval for that direction. An approved artifact, an earlier explicit choice in the conversation, or a repository design decision also counts. General encouragement or an unrelated past choice does not.

| Mode | Required result |
| --- | --- |
| **Audit only** | Inspect and test the existing interface. Report evidence, severity, affected users, and recommended next steps. Do not edit product files. |
| **Proposal only** | Audit first, then provide the information architecture, user flow, content hierarchy, visual direction, states, and responsive behavior needed for a decision. Do not implement. |
| **Implement approved direction** | Confirm the approval evidence, implement only the approved scope, preserve product behavior, validate, and report. If no direction has been approved, finish a concrete proposal before requesting a choice. |
| **Refactor without visual redesign** | Preserve rendered appearance, interaction behavior, routes, copy, and API contracts while improving structure, reuse, tokens, or maintainability. Establish visual baselines first. |
| **Review an existing implementation** | Compare the implementation with the request, approved direction, repository conventions, and validation checklist. Do not fix unless the user also requested fixes. |

If a request combines modes, run them in this order: audit, proposal, approval, implementation or refactor, review.

## Mandatory repository audit

Complete a read-only audit before changing UI code or presenting a detailed direction. Scale the audit to the task, but never skip it.

1. Read repository instructions, including every applicable `AGENTS.md`.
2. Inspect branch and working-tree state. Preserve unrelated and pre-existing changes.
3. Identify the framework, routing, styling method, component libraries, icon set, chart/table/form libraries, animation stack, Three.js/R3F stack, tests, and build commands.
4. Map the affected routes, layouts, roles, navigation, authentication guards, loading boundaries, and responsive behavior.
5. Locate the current token source, global styles, theme provider, persistence key, font loading, and light/dark initialization. Detect conflicting theme objects or providers.
6. Inventory existing primitives before creating another Button, Input, Select, Modal, Drawer, Card, Badge, Tabs, Table, EmptyState, Skeleton, Toast, or ThemeSwitcher.
7. Trace real types, schemas, services, API contracts, domain rules, and existing copy for the affected journey. Mark mock or fallback data as mock.
8. Inspect existing assets, screenshots, logos, product claims, analytics, and 3D assets before proposing replacements.
9. Record the audit evidence and the constraints it creates. Repository code and real API contracts override speculative assumptions.

Do not use the audit to broaden scope. Read adjacent code only far enough to protect behavior and consistency.

## Required workflow

### 1. Inspect

Classify the request, affected role, journey, route, device context, theme requirements, and work mode. Identify what is explicitly requested, what is already approved, and what must remain unchanged.

### 2. Audit

Run the mandatory repository audit. For an existing screen, inspect the rendered result when the environment permits; source review alone cannot verify layout, keyboard behavior, motion, or theme initialization.

### 3. Propose

Connect every proposal to an actual user task and repository capability. Define hierarchy, states, responsive changes, motion, and data requirements. For significant redesigns, present the smallest number of materially different options needed for a decision and recommend one with tradeoffs.

Do not turn the Career Signal concept into fixed marketing copy. Treat it as a narrative model and map each chapter to verified product capability.

### 4. Receive or detect approval

Record the approved option and scope. Approval is present when the user directly asks to implement a defined result, selects a proposal, supplies an approved design, or an applicable repository artifact clearly marks the direction as approved. If a material visual choice is unresolved, complete a reviewable proposal and ask only for that choice.

### 5. Implement

Use existing architecture and primitives. Keep business logic, domain rules, routes, API payloads, loading/error semantics, permissions, analytics, and persistence behavior intact unless the request explicitly changes them. Reuse or consolidate tokens and primitives instead of adding parallel systems.

### 6. Validate

Read and execute [the validation checklist](references/checklist.md). Test observable behavior before claiming it works. Use the repository's existing checks and `scripts/probe.mjs` when a runnable web interface was changed.

### 7. Report

State the selected mode, files changed, user-visible result, preserved behavior, validation commands and results, assumptions, mock content, and unresolved limits. Audit-only, proposal-only, and review work must say explicitly that no product files were changed.

## Reference routing

Read only the references required for the current task. KONEK-specific references take precedence over older generic examples when they conflict.

- Always read [KONEK product profile](references/konek-product-profile.md) for product roles, journeys, terminology, visual direction, and cross-platform boundaries.
- Read [KONEK design system](references/konek-design-system.md) for any visual implementation, theme, token, primitive, or multi-screen proposal.
- Read [landing and scrollytelling](references/landing-scrollytelling.md) for marketing pages, scroll chapters, Three.js, React Three Fiber, or transitions from storytelling into product UI.
- Read [motion policy](references/motion-policy.md) whenever anything animates, including page, panel, feedback, scroll, or WebGL motion.
- Read [responsive rules](references/responsive.md) for responsive implementation or review.
- Read [review workflow](references/review.md) for audit-only work, implementation reviews, or comparisons with an earlier version.
- Read [refactor workflow](references/refactor.md) for refactors that must preserve appearance.
- Read [design process](references/design-process.md) only when the proposal deliverable includes competing wireframes.
- Read the relevant file under `references/components/` or `references/layouts/` only for a component or layout actually in scope. Treat its old visual values as examples where KONEK references now define a different rule.
- Read [Tailwind v4 traps](references/tailwind-v4-traps.md) before changing Tailwind v4 theme configuration.
- Read [the validation checklist](references/checklist.md) before reporting implementation or review work complete.

## Product truth and content safety

- Never invent product capabilities, analysis methods, AI behavior, ranking logic, backend states, integrations, customer logos, testimonials, certifications, awards, security claims, usage counts, performance claims, hiring outcomes, or business metrics.
- Claims require support from repository behavior, a real API contract, an approved product document, or user-provided evidence. If support is absent, use neutral structural copy or label proposal content as placeholder.
- Do not imply that an ATS score, match score, diagnosis, or suggestion is objective or guaranteed unless the product contract defines it. Show evidence, limitations, and status when available.
- Keep mock data internally consistent and visibly identify it in the report. Never present mock values as production facts.
- Use real KONEK assets already in the repository before creating substitutes. Do not attach real company logos to invented customers or jobs.

## Behavior and architecture invariants

- Preserve existing business logic and API behavior unless the user explicitly requests a product change.
- Do not rename fields, reinterpret status values, change request timing, bypass permissions, replace service calls with mock data, or add client-only persistence as a substitute for backend behavior.
- Keep the web and future React Native applications aligned through tokens, types, schemas, API clients, validation, domain logic, suitable product copy, and story chapter configuration. Do not force direct sharing of DOM components, CSS/Tailwind strings, WebGL scenes, browser scroll code, or web layout primitives.
- Ordinary controls remain clear two-dimensional product controls. Use 3D for documents, data, analysis, scanning, and product storytelling, never to turn buttons, inputs, tables, or routine controls into decorative objects.
- Accessibility claims require tested evidence. Report exactly what was tested and avoid statements such as “fully accessible” or “WCAG compliant” without a complete, relevant audit.

## Completion gate

Work is complete only when the selected mode's deliverable exists, required references were applied, the validation checklist was run in proportion to scope, application behavior stayed within authorization, and the report identifies any remaining uncertainty. Do not proceed from skill work into product redesign unless the user explicitly asks for that separate work.
