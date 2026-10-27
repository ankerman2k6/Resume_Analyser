# KONEK product profile

## Source of truth

Use this profile to frame UI decisions, not to invent features. Repository code, real API contracts, approved product documents, and explicit user instructions override assumptions in this file. When sources disagree, report the conflict and follow the most authoritative current source.

Classify each capability as **verified**, **mock/fallback**, **proposed**, or **unknown** before presenting it as product behavior.

## Product and roles

KONEK is an AI-assisted resume analysis, ATS screening, job matching, candidate management, and recruiter platform. Its visual concept is **KONEK Career Signal**: career information enters as a document and becomes structured, explainable signals that help a person decide what to do next.

The two primary roles are:

- **Candidate:** manages a profile and resumes, reviews available analysis or matching information, discovers relevant jobs, and follows applications.
- **Recruiter:** manages jobs and candidates, reviews screening or matching evidence, compares candidates, and moves recruitment work forward.

Do not merge the roles into a generic dashboard. Candidate screens should help one person understand and improve their own career signal. Recruiter screens should support repeated comparison, triage, evidence review, and operational follow-through across many candidates and jobs.

## Main journeys

Treat these as journey models. Include only steps supported by the current scope and verified product behavior.

### Candidate

1. Register or sign in.
2. Build or review a candidate profile.
3. Upload and manage a resume/CV.
4. Review available parsing, analysis, skills, issues, or suggestions.
5. Discover or compare relevant jobs and matching evidence.
6. Apply and follow application status.

### Recruiter

1. Register or sign in as a recruiter.
2. Review the recruiter dashboard and current workload.
3. Create, edit, open, or close jobs when supported.
4. Search, filter, and review candidates.
5. Inspect resume, screening, skill, match, and diagnostic evidence when supported.
6. Compare candidates and act on the recruitment workflow without losing context.

## Product terminology

- Use **candidate** for the person seeking work and **recruiter** for the hiring-side user. In Vietnamese product copy, prefer the repository's established terms, commonly **ứng viên** and **nhà tuyển dụng**.
- Use **resume** or **CV** consistently with the locale and surrounding repository copy. Do not alternate within one flow unless explaining a file format or source label.
- Use **job** only where the current product copy does; otherwise prefer the locale's established product term such as **việc làm** or **bài tuyển dụng**.
- Use **analysis**, **match**, **signal**, **evidence**, **issue**, and **suggestion** as distinct concepts. A suggestion is not an automatic edit; a match is not a hiring decision; a score is not proof.
- Reserve **Career Signal** for the reusable product metaphor and narrative system. It is not a substitute for a specific feature name or a fixed slogan.

## Visual direction

The character is precise, trustworthy, technical, modern, premium, and restrained. Data density is welcome when hierarchy remains clear and long work sessions remain comfortable.

### Core palette

Use semantic tokens in implementation. These values define the approved direction and can be adjusted in the single token source when contrast or brand assets require it.

| Role | Light direction | Dark direction |
| --- | --- | --- |
| Brand navy | `#051A24` or existing KONEK navy | Light foreground on deep navy |
| Page background | Cool white or very light blue-gray | Deep navy around `#070E18`, never pure black |
| Primary surface | White | Navy surface around `#0C1724` |
| Brand action | Cobalt around `#2563EB` | Accessible cobalt/blue adjusted for dark surfaces |
| Supporting accent | Ice blue such as `#DBEAFE` or a token-derived tint | Translucent or darker blue surface with readable foreground |
| Main text | Deep navy | Near-white with reduced glare |
| Muted text | Cool slate with tested contrast | Cool light slate with tested contrast |

Do not scatter these hex values through components. Map them once to semantic tokens and use token names everywhere else.

### Semantic status colors

Maintain one status mapping across candidate and recruiter experiences:

- **Success / complete / strong positive evidence:** green.
- **Warning / attention / partial / expiring:** amber.
- **Danger / error / destructive / failed:** red.
- **Information / processing / active analysis:** blue.
- **Neutral / pending / inactive / unknown:** slate.

Status meaning must also be conveyed through text, icon, pattern, or structure. Color alone is insufficient. A high or low metric is not automatically good or bad; determine semantics from the domain contract.

## Typography

Inter is the default product font because it supports Vietnamese glyphs and dense interface work. Use one family across headings, body text, tables, controls, and numbers. Build hierarchy with size, weight, spacing, and placement. Verify the font actually loads and that Vietnamese diacritics render without clipping.

## Surface hierarchy

### Light mode

1. Page background: coolest and quietest layer.
2. Product surface: white or near-white cards, tables, inputs, and navigation.
3. Raised surface: menus, popovers, drawers, and dialogs with a boundary and meaningful elevation.
4. Focused or selected surface: tokenized blue or neutral tint with readable text and a second non-color cue where meaning requires it.

### Dark mode

1. Page background: deepest navy.
2. Product surface: a slightly lighter navy.
3. Raised surface: lighter again, separated by border and reserved shadow.
4. Focused or selected surface: a controlled blue/ice tint that does not bloom or reduce text contrast.

Dark mode is a designed palette, not an inversion. Avoid pure black, pure white body text, muddy translucent layers, and light-mode shadows copied unchanged.

## Candidate-facing rules

- Lead with the person's next useful action, then supporting evidence.
- Explain analysis and match outputs in plain language. Show what the result is based on when the product exposes that evidence.
- Keep resume upload, processing, failure, retry, and completion states calm and explicit.
- Do not frame suggestions as deficiencies in the person. Describe document or match evidence and a concrete next step.
- Avoid recruiter-only pipeline language and aggregate comparison patterns unless the candidate journey truly uses them.

## Recruiter-facing rules

- Optimize for scanning, comparison, filtering, bulk work, and returning to context.
- Keep job, candidate, status, evidence, and next action visible without excessive navigation.
- Separate system analysis from recruiter decisions. Never present an AI score as the final hiring decision.
- Data tables and dense lists must retain keyboard access, readable columns, stable row actions, loading/error/empty states, and responsive alternatives.
- Use semantic status consistently across dashboards, jobs, candidate lists, and details.

## Future React Native compatibility

Design portable product foundations, not identical rendering.

Share where practical:

- semantic design-token objects and raw palette values;
- TypeScript types, schemas, and domain enums;
- API contracts and platform-neutral API client logic;
- validation rules and error models;
- domain calculations and formatting rules with platform adapters where needed;
- product copy when platform context is the same;
- Career Signal story chapter configuration and capability identifiers.

Do not expect direct sharing of:

- DOM components or HTML semantics;
- CSS, CSS custom properties, or Tailwind class strings;
- WebGL/R3F scenes;
- browser scroll observers or sticky positioning code;
- web-only focus, hover, pointer, or layout primitives.

Keep tokens and domain configuration serializable. Keep platform checks at adapter boundaries rather than inside shared domain logic.
