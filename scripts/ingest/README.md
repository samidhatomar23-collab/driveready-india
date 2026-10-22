# Ingestion pipeline (Phase 2 - not implemented yet)

Planned flow: `fetch` (once, rate-limited, robots.txt-aware, public pages/PDFs only) -> `extract` (PDF/HTML -> text) -> `map` (to the Question schema) -> `review` (human) -> static JSON in `src/data/questions/`.

Rules:
* Never scrape anything behind a login/OTP; never call the live Sarathi portal from the app.
* Record `sourceUrl`, `sourceDoc`, `retrievedOn` for every item.
* Anything without a confirmed official source stays `verified: false`.
