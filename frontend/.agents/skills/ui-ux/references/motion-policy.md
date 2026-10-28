# KONEK motion policy

Motion explains cause, hierarchy, continuity, and system status. It should make KONEK easier to follow without making long sessions tiring.

## Duration ranges

| Motion | Duration | Typical use |
| --- | --- | --- |
| Immediate feedback | 80–120 ms | pressed state, checkbox mark, tiny color response |
| Micro interaction | 120–180 ms | hover, focus, icon change, tooltip entrance |
| Component state | 160–240 ms | tabs, validation message, accordion, small popover |
| Page or route transition | 220–320 ms | content entrance/exit where routing architecture supports it |
| Panel, drawer, or modal | 240–320 ms | overlays that preserve spatial continuity |
| Story chapter transition | 300–600 ms | meaningful staged change in the Career Signal narrative |

Exit motion may be slightly faster than entrance motion. Do not stack delays across routine product controls. A marketing chapter may sequence a few elements, but the user must never wait for animation before acting.

## Properties

Prefer compositor-friendly `transform` and `opacity`. Animate color and border color for small state changes when contrast remains valid. Animate clip paths, filters, large blurs, shadows, gradients, width, height, top, left, grid tracks, or complex SVG paths only when the effect is necessary, measured, and cannot be expressed more cheaply.

Layout animation is acceptable for a bounded element when it explains expansion, reordering, or continuity and does not shift unrelated content unexpectedly. Avoid animating table row geometry during routine loading or sorting.

## Spring motion

Use springs for direct manipulation or an object with a clear physical relationship: dragging, snapping, a document settling into a scanner, or a panel that tracks a gesture. Use eased timing for ordinary page, modal, drawer, tooltip, and status transitions. Springs must settle quickly without repeated bounce. Never apply spring motion to body text, tables, form validation, or every scroll chapter by default.

## Motion hierarchy

At any moment, motion priority is:

1. user action feedback;
2. system state or progress;
3. navigation and spatial continuity;
4. explanatory product storytelling;
5. ambient decoration.

Lower-priority motion pauses or simplifies when higher-priority motion begins. A loading indicator should not compete with a moving background, and a dialog opening should quiet the scene behind it.

## Continuous-animation limit

- Desktop: at most two continuous animation systems visible at once.
- Mobile or slow-device mode: at most one, and prefer zero in product screens.
- A system means one coordinated purpose, such as a scan pulse or bounded signal flow; splitting particles into multiple components does not increase the allowance.
- Product dashboards should have no continuous ambient animation. Progress, live status, and explicitly requested data updates are exceptions tied to system meaning.
- Pause continuous work when off-screen, occluded by a modal, in a background tab, or outside the active story chapter.

## Mobile and reduced motion

On mobile, shorten travel distance, remove parallax and hover-only effects, reduce simultaneous elements, simplify 3D quality, and avoid long pinned sequences. Do not rely on device class alone; also respond to measured performance and input type.

For `prefers-reduced-motion: reduce`:

- remove continuous, parallax, depth, orbit, bounce, and particle-travel motion;
- make route and panel changes immediate or use a brief opacity change no longer than 120 ms;
- keep progress understandable with text and static state;
- preserve focus movement and do not use animated scrolling;
- do not autoplay motion that the user must stop manually.

Reduced motion changes presentation, not content, order, functionality, or access to outcomes.

## Validation

Test motion at normal speed, reduced motion, mobile width, CPU throttling, and after the document returns from a hidden tab. Check that animations stop, resume safely, do not replay unnecessarily after hydration or navigation, and do not create layout shift. Report tested conditions rather than making a general accessibility or performance claim.
