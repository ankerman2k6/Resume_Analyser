# Landing pages and Career Signal scrollytelling

Use this reference for product marketing pages, scroll-led narratives, Three.js or React Three Fiber scenes, and transitions from a marketing experience into real KONEK product UI.

## Tell one product story

Build a causal narrative rather than a stack of unrelated hero, feature, logo, testimonial, and pricing sections. Each chapter should answer:

1. What information entered the system?
2. What changed or became visible?
3. Why does that matter to the candidate or recruiter?
4. What real product surface lets the user act on it?

Use the approved Career Signal sequence as a reusable model:

`resume input → document parsing → semantic skill extraction → job matching → problem diagnosis → suggested improvement → candidate/recruiter outcomes → transition into the real product`

This is a narrative configuration, not hard-coded marketing copy. Omit, reorder, or rename a chapter when verified product capabilities require it. Never depict an unsupported analysis, guarantee, or outcome.

## Sticky scroll-stage architecture

Use three layers:

1. **Semantic DOM narrative:** headings, explanations, controls, links, and fallbacks remain accessible and indexable.
2. **Sticky presentation stage:** one bounded sticky region presents the current visual state. It must release cleanly before the following product content.
3. **Chapter track:** DOM chapters create scroll distance and expose discrete state plus local progress.

Keep the sticky stage inside a measured section rather than fixing a canvas across the entire page. Define an explicit start, end, and handoff so the scene does not cover navigation, footer, dialogs, or real product UI.

## Separate DOM and WebGL

- Put copy, navigation, calls to action, forms, product controls, accessibility semantics, and fallback content in the DOM.
- Use WebGL for document, signal, data, scan, extraction, and matching visuals that materially clarify the story.
- Do not render essential text inside a canvas.
- Keep scene state derived from a small chapter model instead of DOM queries scattered through 3D components.
- The DOM experience must remain coherent if the canvas fails, is disabled, or is replaced by a static illustration.

## Chapter and state model

Represent the story as serializable configuration that may later be shared with a React Native narrative surface:

```ts
type CareerSignalChapter = {
  id: string;
  capabilityId: string;
  audience: 'candidate' | 'recruiter' | 'both';
  titleKey: string;
  bodyKey: string;
  visualState: string;
  outcomeKey: string;
};
```

Keep `activeChapter` discrete. Keep local progress as an imperative or external motion value. Update React state only when the active chapter changes, not on every scroll frame.

Use `IntersectionObserver`, a scroll timeline library already in the repository, or one passive scroll listener feeding a single `requestAnimationFrame`. In R3F, read progress from a ref or motion value inside `useFrame`. Do not call `setState` on every scroll event or animation frame.

## Animation meaning

Every major animation must explain a verified feature, a state transition, or a user outcome. Examples include a document separating into structured fields, skills clustering from parsed evidence, job requirements aligning with candidate evidence, an issue being located in context, or a suggestion changing the signal.

Do not use:

- decorative particle overload;
- gratuitous confetti;
- fake terminals, fake code streams, or fake AI reasoning;
- generic glowing brains, magic orbs, robot heads, or unexplained neural networks;
- random floating objects that do not map to product information;
- constant camera motion whose only purpose is spectacle.

Particles may represent bounded signal flow when the relationship is clear, the count is modest, and the story remains legible without them.

## React Three Fiber and Three.js guidance

- Use R3F for React lifecycle integration and Drei helpers already present in the repository; use direct Three.js only for focused utilities or performance-sensitive systems that benefit from it.
- Keep scene ownership clear: canvas shell, chapter controller, scene objects, lighting, and post-processing should not share unrelated UI state.
- Dispose geometry, material, texture, render target, listeners, and observers when their owner unmounts.
- Prefer instancing and shared geometry/materials for repeated signal elements.
- Avoid real-time shadows and expensive post-processing unless they communicate depth essential to the document/data scene.
- Clamp device pixel ratio and provide quality tiers based on viewport and measured capability.
- Pause render work when the scene is off-screen, the document is hidden, or the user opens a product route that no longer shows it. Use demand rendering for static chapters when practical.

## Performance budgets

Set task-specific budgets and measure them. Use these defaults when the repository has none:

| Budget | Desktop target | Mobile or slow-device target |
| --- | --- | --- |
| Frame time while scrolling | ≤ 16.7 ms for most frames | ≤ 33.3 ms for most frames |
| Draw calls | ≤ 100 | ≤ 60 |
| Visible triangles | ≤ 150k | ≤ 75k |
| Texture memory for the story scene | ≤ 64 MB | ≤ 32 MB |
| Device pixel ratio | clamp to 1.5 | clamp to 1–1.25 |
| Main-thread scroll work | ≤ 4 ms per frame | ≤ 4 ms per frame |

Lazy-load the 3D scene and large assets. Compress geometry and textures where the existing toolchain supports it. Keep the initial DOM story usable while WebGL loads. Measure on a throttled CPU and network profile; a powerful development machine is not evidence of slow-device performance.

## Mobile behavior

- Prefer a shorter sticky range, simpler camera, fewer objects, smaller textures, and at most one continuous ambient animation.
- If the desktop composition depends on wide spatial relationships, replace it with chapter illustrations, short controlled clips, or simplified 3D rather than shrinking the whole scene.
- Keep copy in normal document flow. Avoid trapping the entire mobile page inside a long pinned canvas.
- Respect safe-area insets for navigation and fixed calls to action.

## WebGL fallback

Detect support and handle context creation failure or context loss. The fallback must preserve the same chapter order and capability mapping through DOM content plus static product imagery, diagrams, or CSS shapes. Keep the primary call to action available. Do not show a blank canvas, loader that never resolves, or technical error message to ordinary users.

## Reduced motion

When `prefers-reduced-motion: reduce` is active:

- replace continuous camera and object motion with discrete states or crossfades;
- remove parallax, particle travel, oscillation, and depth zoom;
- keep chapter changes immediate or use a short opacity transition;
- preserve all content and calls to action;
- do not require scrolling through large empty ranges to reveal static states.

Follow [the motion policy](motion-policy.md) for timing and animation limits.

## Transition into real product UI

End the story by resolving the visual metaphor into an authentic DOM product surface tied to the relevant role: a candidate analysis/match view, recruiter candidate/job workspace, or another verified route. Match the real product's tokens, typography, density, states, and terminology. The transition should reduce spectacle and increase information clarity.

Do not build a fake dashboard solely for the landing page when a real product surface exists. If authentication prevents a live embed, use a faithful, clearly non-interactive representation derived from the actual interface and avoid fabricated data claims.
