# SOURCES

Last checked: 2026-10-22. Each question in `src/data/questions/` carries `sourceDoc` (document + regulation/clause), `sourceUrl`, `retrievedOn` and `verified`.

## What was checked
| Data | Checked against | Status |
|---|---|---|
| Rules of the road questions (right of way, signals, overtaking, parking, lights, horn, markings) | **Motor Vehicles (Driving) Regulations, 2017** (G.S.R. 634(E), 23 Jun 2017; amended by G.S.R. 586(E), 25 Sep 2020), regulation numbers shown on each question | 72 of 89 questions `verified:true` (including sign questions) |
| Road sign shapes and names | **IRC:67-2012 Code of Practice for Road Signs** (clause shown on each sign) | 22 of 28 signs verified |
| State test settings | Not available as one official table | All states use a generic **practice format** (15 questions, 9 to pass, 30 s), clearly labelled as such |
| Fines | Section references only, no amounts | Not shown in the app |
| Hindi text | Written by the assistant | Needs review by a native Hindi speaker |

## Important limits
* The regulation text was read from a public copy (Indian Kanoon, https://indiankanoon.org/doc/164893636/) of the Gazette notification. That page itself notes the original gazette could not be verified, and a few passages are garbled. **Before relying on any item legally, compare it with the Gazette PDF (egazette.gov.in).**
* IRC:67-2012 was read from a copy hosted at https://www.sir.advancedleadership.harvard.edu/s/ircgovin0672012.pdf.
* Sign pictures are still drawn placeholders (`imagePlaceholder:true`).
* Real Test Mode only uses `verified:true` questions.

## Still unverified (17 questions, 6 signs)
Slippery Road, Cattle, Hospital, First Aid Post, Telephone, Resting Place signs (not found in the text read); right-turn priority versus oncoming traffic; whether to cancel an indicator after a turn; broken centre line; zebra-crossing markings. These stay `verified:false` until confirmed.

## Official sources
* Parivahan https://parivahan.gov.in - Sarathi https://sarathi.parivahan.gov.in
* MoRTH https://morth.gov.in - India Code https://indiacode.nic.in - e-Gazette https://egazette.gov.in

## Marking an item verified
Open the official document, find the clause, set `sourceDoc`, `sourceUrl`, `retrievedOn` (YYYY-MM-DD) and `verified: true`. `npm run validate:content` enforces the fields.
