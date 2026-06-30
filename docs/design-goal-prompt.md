# YouTube Bank Design Goal Prompt

## Goal
Redesign the YouTube Bank note-generation experience so the product feels like a focused learning workspace, not a debug output viewer. Start with the generated note result screen, then improve the setup flow only where it directly supports that result.

## Operating Mode
Use RepoPrompt first to keep context tight:

- Select `src/app/note/page.tsx`, `src/app/api/note/generate/route.ts`, `src/app/settings/page.tsx`, `src/store/useAPIKeysStore.ts`, `src/lib/api-key.ts`, and `package.json`.
- Search before editing for `GeneratedNote`, `fullSummary`, `segments`, `insights`, `saveMode`, `currentTab`, and existing icon imports.
- Keep changes scoped. Do not redesign unrelated dashboard/trend pages.

Use Ouroboros-style pressure before implementation:

- Intent: make generated notes readable, trustworthy, and useful for study.
- Non-goals: no landing-page rebuild, no new AI provider architecture, no new persistence model, no new design library.
- Decision boundary: the agent may change result layout, copy labels, spacing, empty states, and local rendering helpers. Ask only before adding dependencies, changing data contracts broadly, or removing existing save/share behavior.
- Simplifier pass: prefer one result-screen refactor over a full app restyle.

## Current Evidence
The app now reaches Gemini video URL fallback and returns note data, but recent output exposed raw fenced JSON in the summary area. The result screen also overuses large bordered cards and emoji-prefixed labels, making the product feel unfinished.

Relevant current state:

- The primary UI file is `src/app/note/page.tsx`.
- Note generation returns `fullSummary`, `segments`, and `insights` from `src/app/api/note/generate/route.ts`.
- Gemini 2.5+ is required; default remains `gemini-2.5-flash`.
- `gemini-3.1-flash-lite` should remain selectable.
- Existing dependencies include `lucide-react` and `framer-motion`; do not add a new icon package unless explicitly approved.

## Design Direction
Position the app as a personal learning workspace:

- Calm neutral base: zinc/slate whites and soft borders.
- Single accent: restrained YouTube red or deep rose.
- No purple AI gradients.
- No emoji-driven UI labels in touched sections; use existing lucide icons and clear text.
- Avoid card nesting. Use sections, dividers, and asymmetric layout.
- Keep mobile as a strict single column.

## First Implementation Slice
Only redesign the result screen in `src/app/note/page.tsx`.

Required changes:

1. Replace the current "전체 영상 + 전체 요약" card with a two-column desktop layout:
   - left: video player and source metadata
   - right: concise summary panel
   - mobile: video first, summary below

2. Replace the timestamp table with a vertical chapter timeline:
   - each segment shows time range, title, summary, and key points
   - no raw JSON should ever render as visible content

3. Replace the insight card with three study sections:
   - main takeaways
   - reflection questions
   - further study

4. Add defensive display helpers:
   - if summary is empty, show a short fallback sentence
   - if segments are empty, show a useful empty state
   - if a string starts with fenced JSON or `{ "fullSummary"` then parse/unwrap or hide it

5. Preserve existing behaviors:
   - YouTube iframe playback
   - segment start/end embeds
   - download mode
   - Firebase save mode
   - share/delete behavior

## Constraints
- No new dependencies.
- Use installed `lucide-react` icons.
- Tailwind v4 project; avoid v3-only assumptions.
- Do not use `h-screen`; use responsive content flow.
- Keep design changes in as few files as practical.
- Do not touch transcript extraction unless result rendering requires it.
- Do not introduce global state.

## Acceptance Criteria
- A newly generated Gemini fallback note does not display raw JSON, fenced code blocks, or escaped object text in the summary.
- The result page reads as a polished learning note with clear hierarchy.
- The result page works on mobile without horizontal scroll.
- Empty or partial Gemini output still renders a useful state instead of a blank section.
- `next build` passes.
- `tsc --noEmit` passes after build.

## Suggested Verification
Run:

```bash
PATH="/Users/moon/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PWD/node_modules/.bin:$PATH" ./node_modules/.bin/next build
PATH="/Users/moon/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PWD/node_modules/.bin:$PATH" ./node_modules/.bin/tsc --noEmit
```

Manual check:

- Open `/note`.
- Generate a note from a Korean YouTube video using Gemini.
- Confirm the summary is natural Korean prose, not JSON.
- Confirm chapter timeline and insight sections are populated or show graceful empty states.
