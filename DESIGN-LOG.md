# DESIGN-LOG: Gauge Rafting (a Next.js rebuild of the boilerplate site)

Run type: Full. Mode: Adaptive. Tools: Node 22, Next.js 15 (static export), Playwright (Chromium), the gate (`npm run verify`). The grade is not kept in this repository.

## Traversal Plan
Seed (stated first): *a rafting site should answer the one question rafters actually ask, "what can my group ride at this water level?", and every page should be a different view of that answer.* Moves: M1 one number (the river level in cfs) drives every rapid, trip, price, eligibility rule and the page colour; M2 the river drawn as a profile with a raft you can run down it; M3 a gate that recomputes every figure from the data and compares it with the exported HTML; M4 who may ride is decided by the class of the hardest rapid at that flow, not by age alone; M5 a new look: a flood-warning poster instead of the teal-and-orange rafting brochure.

### Frontier (after R0)
- OPEN: the repository is an untouched create-next-app starter.
- DEFERRED: real photographs (none are invented), live gauge data, booking and payment, an elevation baseline label, equal vertical exaggeration between rivers.

## R0 premortem (measured)
Before any change: `npm ci` fails (the lockfile is out of sync with package.json: Next ^13.5.2 against a 15.1.6 lock, tailwind plugins missing); `next.config.ts` with `experimental.appDir` is invalid for the pinned Next; the home page links `/book-now`, which does not exist, and shows `/rafting-logo.svg`, which does not exist; 6 pages of boilerplate text; no data, no model, no test. The old version is kept on the branch `legacy/original-boilerplate`.

## Decision Records
- **M1 (BREAK)** One number runs the site. The gauge (cfs) is in the URL (`?cfs=1200&n=4&age=14&lb=120&exp=some&river=granite-run`), never in storage; every link carries it; the page colour follows it.
- **M2 (KEEP-THE-RULE)** The river profile is drawn in real pixels (viewBox = container width, minimum 240); circle area grows with class; a zigzag draws each rapid's whitewater; an elevation axis states the vertical exaggeration.
- **M3 (KEEP-THE-RULE)** `lib/model.ts` has no imports so the gate can run the exact file; `scripts/check.mjs` recomputes class, labels, water status, elevation, quotes and eligibility independently and compares the numbers printed in `out/*.html`.
- **M4 (KEEP-THE-RULE)** Class ceilings: no experience II+, a few easy trips III+, class III experience V+; II+ under age 10, III+ under 14. A trip that passes a rapid above the limit is refused with the rapid and the limit named.
- **M5 (BREAK)** After the first version was called "uninspired in colour and too much like other rafting sites": near-black ink, warm paper, hi-vis acid, a hazard-stripe header, a giant scoreboard readout, and a page colour that is the river level on a heat scale (emerald at low water through cobalt to magenta and crimson at flood, interpolated in oklch so the middle stays vivid). Contrast is gated at nine points of the scale in both schemes.

## Panel Reports
Seats from `pick_panel.py --run-type full` (8 seats): Debord, Shklovsky, Holmes, Mace, Cairo, Tufte, Krug, Ortega y Gasset (dotted pairs Debord-Krug, Shklovsky-Krug).

### Panel, WHOLE, round R1  (artifact examined: http://localhost:8140 after M1 to M3)
| Critic | Anchor used | Observed in the work | Verdict PASS/OBJECT | Requested change |
|---|---|---|---|---|
| Critic: Provocateur (Debord) | The Society of the Spectacle | the model computed each rapid's class and then ignored it when admitting riders: a 5 year old with no experience was told "can take this trip" at class III+ | OBJECT | admit by class |
| Critic: Provocateur (Shklovsky) | Art as Technique | the one strange device (a rapid whose class moves with flow) started 828 px down; the rest was a neo-brutalist card kit; the page colour moved 3.8% of first-viewport pixels | OBJECT | lead with the profile, make the colour carry the level |
| Critic: Inclusion (Holmes) | Mismatch | the number box refused typing; the slider ignored arrow keys; the raft status fired 98 live announcements in one run; the header focus ring was invisible | OBJECT | typing, 60 slider steps, announce only rapids, a visible ring |
| Critic: Inclusion (Mace) | Principles of Universal Design | "cfs" was never defined; out-of-range entries failed silently; pounds only | OBJECT | define cfs, explain errors, kg and km |
| Critic: Evidence (Cairo) | How Charts Lie | 810 profile and 569 finder checks matched, but Granite Run read "Good water, hardest rapid V"; 12 of 31 model mutants survived | OBJECT | class-aware status, more tests |
| Critic: Evidence (Tufte) | The Visual Display of Quantitative Information | vertical exaggeration 122x / 35x / 20x with no axis; badge radius not area-true; closed-river label clipped at 375 | OBJECT | an elevation axis, area-true circles, wrapped label |
| Critic: Usability (Krug) | Don't Make Me Think | the primary button sat 2.7 screens down on a phone; typing "3000" left 1200; "Book now" promised more than the page did | OBJECT | the gauge in the first viewport, honest labels |
| Critic: Detachment (Ortega y Gasset) | Meditations on Quixote | the purpose was split between "demo" and "Book now"; the group inputs lived only on Plan | OBJECT | group fields in the hero, "Request a trip" |

### Panel, WHOLE, round R2  (artifact examined: http://localhost:8140 after the R1 resolutions and the new theme; all 8 seats re-seated)
| Critic | Anchor used | Observed in the work | Verdict PASS/OBJECT | Requested change |
|---|---|---|---|---|
| Critic: Provocateur (Debord) | The Society of the Spectacle | class limits work (age 5, none, 2,000 cfs: 0 of 5 trips); the cap printed only in tables; the About page still described the old colours | OBJECT | mark the cap everywhere; fix the copy |
| Critic: Provocateur (Shklovsky) | Art as Technique | the colour now moves 48.4% of viewport pixels (was 3.8%); the profile still starts below the first viewport | OBJECT | profile higher (deferred) |
| Critic: Inclusion (Holmes) | Mismatch | typing and arrow keys work; 5 raft announcements (was 98); the dark readout was 1.1:1 | OBJECT | readout contrast (fixed) |
| Critic: Inclusion (Mace) | Principles of Universal Design | errors explained; 33 tab stops on a phone (was 62); units still miles and feet | OBJECT | km, a skip link (fixed) |
| Critic: Evidence (Cairo) | How Charts Lie | 612 finder states, 0 mismatches; refusals printed "class II+, limit II+" (816 sentences); IV+ printed from raw 4.25 while the pushy rule fired at 4.5; 17 of 55 mutants survived | OBJECT | compare the shown class; more tests |
| Critic: Evidence (Tufte) | The Visual Display of Quantitative Information | badge area / class = 1.00; the exaggeration printed equals the computed one; "III+" wider than its circle; badges bright on a closed river | OBJECT | dim closed badges, 12 px numerals at narrow widths |
| Critic: Usability (Krug) | Don't Make Me Think | the gauge, group and verdicts are in the first viewport at 375 | OBJECT | none blocking after the readout fix |
| Critic: Detachment (Ortega y Gasset) | Meditations on Quixote | the ceiling overcorrected: the family float was closed to beginners at the default 1,200 cfs; no alternative offered when a river is closed | OBJECT | rebalance Elk Fork; list runnable months |

## Resolutions
- Debord F1 to F3, Ortega F3, Cairo F1: ADAPT. Class ceilings and a class-aware "pushy" status; refusals name the rapid and the limit; the shown (rounded) class is what is compared, so a refusal never contradicts itself (gated over 18 groups x 6 flows).
- Debord F5, Cairo F6: ADAPT. A class above V+ prints "(cap)" in tables and sentences and "*" on a badge, with a legend.
- Shklovsky F1: ADAPT in part. The gauge, the group and the verdicts lead the page; the profile follows directly. DEFERRED: the profile above the group fields.
- Shklovsky F3, Debord F6: ADAPT. The page colour is the level: 3.8% to 48.4% of first-viewport pixels.
- Holmes F1 to F6, Mace F1 to F8, Krug F2, F5, F7: ADAPT. Typed numbers (draft, validation, URL notice), 60 slider steps, announcements at rapids only, acid focus ring, a check mark on pressed chips, cfs defined, kg and km, a skip link to the profile, footer and 404 links carry the state, a disabled-until-written Contact button, roving focus with Home and End on the months.
- Krug F1, F4, Ortega F1, F4: ADAPT. "Request a trip" and "Find a trip" match their page titles; the group fields sit in the hero.
- Tufte F1, F2, F3, F4, N1: ADAPT. An elevation axis in ft with the printed exaggeration (gated against geometry); circle area proportional to class; the veil label wraps; closed-river badges dim; numerals 12 px at narrow widths; the minimum width is 240.
- Ortega N1: ADAPT. Elk Fork rebalanced so a beginner can ride it across its whole runnable range; blocked rivers list the months they typically run.
- Cairo F8: ADAPT. Mutation survivors killed with tests for the refusal sentences, the water words, the season functions and the formats.
- Tufte F7 (the unlabelled baseline), exaggeration differing between rivers, the ramp's lightness not monotone: DEFERRED with reasons (it would redraw every river to one vertical scale, hiding the small rivers; the colour is a heat scale, not a lightness scale).
- Debord boldest change (withhold the verdict when the model is clamped): DEFERRED; the cap is now marked instead.

## Anchor Ledger
Debord: spectacle. Shklovsky: art as technique. Holmes: mismatch. Mace: universal design. Cairo: how charts lie. Tufte: graphical integrity. Krug: don't make me think. Ortega y Gasset: distance from the thing.

## Deletion review and residual diff (Step 2f)
Deleted: the create-next-app starter, tailwind and its plugins, the lockfile (rewritten), `next.config.ts` with `appDir`, and the dead `/rafting-logo.svg` reference. Kept: the routes `/about`, `/contact`, `/book-now` (the old links), the MIT licence and CONTRIBUTING.md.

## Step 2g: figures re-measured at the final state
Granite Run at 1,200 cfs: hardest rapid Dentist's Chair, class III+; at 3,000 cfs, class V (a 12 year old with a few easy trips is refused, an experienced adult is not). Eight people on the Granite Run day trip: $972 after 10% off, deposit $243. Badge area over class: 1.00. Printed vertical exaggeration at 1280: 130x, 38x, 21x, equal to the geometry. Contrast of the water-coloured text over the page: 5.6:1 or better at nine points of the scale. All gated.

## Stop test
- **S1** Frontier: no OPEN items; DEFERRED items carry reasons. Met.
- **S2** R2 re-seated all 8: every seat OBJECTed with narrow findings, all fixed afterwards and measured (gate, screenshots), not re-judged. Partly met.
- **S3** Two consecutive quiet WHOLE rounds: NOT met.
- **S4** Ambition push: from an untouched starter to a model-driven site whose colour is its data. Measured: pages 6 to 14; gate checks 0 to ~300; viewport colour movement 3.8% to 48.4%.
- **S5** Dotted edges Debord-Krug and Shklovsky-Krug: all three objected in R1 and R2 and every finding was adopted or deferred with reasons. Met.

## Double loop
The author built a model that computed each rapid's class and then admitted riders by age alone; the site answered the question it had computed, not the one the visitor asked. Only a seat that tried a five-year-old at 2,000 cfs saw it. The second loop: a rule fixed in the model must be fixed in the sentence, the status word and the badge too, so the gate now checks the sentence against the rule.

## Carry-Forward Ledger
- A computed quantity (class) must reach every decision that depends on it (admission, status, price of risk), not only the picture.
- A number box needs a draft: validate on change, apply when valid, explain when not.
- Define a unit at first use (cfs), and give both unit systems where visitors differ.
- A theme that is data (colour = river level) beats a theme that is decoration; gate its contrast across the whole range, and interpolate in a space (oklch) that keeps the middle vivid.
- Hide nothing: where the model caps, the page says "(cap)".
- Put the first action (the gauge) and its consequence (who can ride) in the first viewport on a phone.
- Keep the grade out of the project repository; the dada ledger holds it.

## Compliance Check
- [x] Mode stated with the reason (Adaptive: public reader)
- [x] Panel seated from `pick_panel.py`, every seat briefed from its `seats/` file
- [x] Seed stated first
- [x] Run type stated (Full)
- [x] BREAK moves taken (M1, M5)
- [x] Decision Record per move
- [x] Panel Report per round, every critic citing something observed
- [x] Every OBJECT resolved ADAPT, OVERRULE or DEFERRED
- [ ] WHOLE rounds with S3 met: R0 (measured), R1, R2 run; S3 not met
- [ ] Every objecting seat re-judged after its last fix: none were
- [x] Every printed figure re-measured at the final state (Step 2g)
- [x] Anchor Ledger complete
- [x] Double-loop paragraph written
- [x] Run recorded in the dada ledger (the grade is kept there, not in this repository)
