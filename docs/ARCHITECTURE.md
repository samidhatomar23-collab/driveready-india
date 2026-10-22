# DriveReady India — Architecture & Data Model

## Folder structure

```
driveready-india/
├─ index.html, vite.config.ts, tailwind.config.js   # Vite + PWA (vite-plugin-pwa / Workbox)
├─ public/icons/                                    # original app icon / mascot
├─ src/
│  ├─ main.tsx, App.tsx, index.css
│  ├─ types.ts                  # all shared types (Question schema lives here)
│  ├─ lib/
│  │  ├─ storage.ts             # IndexedDB (idb-keyval) persistence
│  │  ├─ store.ts               # zustand store: settings + progress, hearts, XP, streak
│  │  ├─ content.ts             # lazy-loaded JSON content + i18n helpers
│  │  ├─ srs.ts                 # Leitner spaced repetition
│  │  └─ sound.ts               # WebAudio beeps (original, mutable)
│  ├─ components/               # Mascot, TabBar, Button, Sheet, Sign graphic …
│  ├─ screens/                  # Onboarding, Learn, Lesson, Practice, MockTest, Signs, Profile, About
│  └─ data/
│     ├─ units.json             # units + lessons (learning path)
│     ├─ questions/<unit>.json  # one file per unit (lazy-loaded)
│     ├─ signs.json             # road signs library
│     ├─ states.json            # per-state LL test config
│     ├─ fines.json             # fines reference (Phase 1: sample, unverified)
│     └─ i18n/{en,hi}.json      # UI strings (add more languages here)
├─ scripts/
│  ├─ validate-content.mjs      # schema/sanity check for all JSON
│  └─ ingest/                   # Phase 2: official PDF/page → JSON pipeline
├─ docs/ARCHITECTURE.md, README.md, SOURCES.md
```

## Data model

* **Question** — exactly the schema in the brief (`id, topic, unit, lessonId, type, difficulty, question, options[], correctAnswer, explanation, imageRef, languages{en,hi}, applicableVehicleClasses[], statesApplicable[], sourceUrl, sourceDoc, retrievedOn, verified`) plus optional `pairs` (match) and `ruleRef`.
* **Unit → Lessons → questionIds**: a lesson draws questions by `lessonId`; the last lesson of a unit (`*-checkpoint`) samples from the whole unit.
* **StateConfig**: `llTest { questionCount, passMark, secondsPerQuestion }` — Real Test Mode reads only this.
* **Progress** (IndexedDB): XP, hearts, streak, per-node stars, SRS boxes, test history, error reports.
* **Settings**: state, vehicle class, language, daily goal, sound, dark, large text.

## Principles
* Local-first: the app never needs a network after the first load; no auth required.
* Content is static JSON, lazy-loaded per unit, precached by the service worker.
* Nothing is marked `verified: true` until a human has checked it against the cited official source.
