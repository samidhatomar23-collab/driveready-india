# SOURCES

Status of every data set shipped in Phase 1. **Nothing is marked `verified: true` yet.**

| Data | File | Basis | Status |
|---|---|---|---|
| Questions (89) | `src/data/questions/*.json` | Original practice items written from commonly taught rules; each cites the general source (India Code / MoRTH) and a rule area, **not a verified clause** | `verified:false`, `retrievedOn:null` - check each against the official text |
| Road signs (28) | `src/data/signs.json` | Names/meanings of common signs per MV Act 1988 First Schedule; graphics are **drawn placeholders** (`imagePlaceholder:true`) | Replace with official MoRTH artwork; verify meanings |
| State test config | `src/data/states.json` | **Placeholder** question counts / pass marks / timings (e.g. 15/9, 20/12) | Confirm per state on parivahan.gov.in / sarathi.parivahan.gov.in |
| Fines | `src/data/fines.json` | Section references only; **no amounts** until loaded from India Code | Not shown in the UI yet |
| Hindi text | question `languages.hi`, `i18n/hi.json` | Translation written by the assistant | Needs review by a native Hindi speaker |

## Official sources to verify against
* Parivahan - https://parivahan.gov.in ; Sarathi - https://sarathi.parivahan.gov.in
* MoRTH - https://morth.nic.in (road signs, Rules of the Road Regulations 2017)
* India Code - https://indiacode.nic.in (Motor Vehicles Act 1988, 2019 Amendment)
* State transport department / RTO sites; data.gov.in

## Process to mark an item verified
1. Open the cited official document, find the clause/page.
2. Set `sourceUrl` to the exact document, `sourceDoc` to its title + clause, `retrievedOn` to the date (YYYY-MM-DD).
3. Set `verified: true`. `npm run validate:content` enforces `retrievedOn` + `sourceUrl` for verified items.
