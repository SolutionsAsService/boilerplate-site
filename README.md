# Gauge Rafting

A whitewater rafting site built with Next.js 15 (App Router, static export). One number, the river level in cubic feet per second, runs the whole site: it changes the class of every rapid, which trips can run, who may ride, the price and even the colour of the page.

Gauge Rafting is a **demonstration**: the outfitter, rivers, prices and policies are invented. No booking is taken and no payment is collected.

## Run it

```bash
npm ci
npm run dev        # http://localhost:3000
npm run verify     # next build, then the gate
npm run serve      # serves out/ on :8140 with the headers from vercel.json
```

## How it is built

| Path | What it is |
|---|---|
| `data/rivers.json`, `data/trips.json` | every river, rapid, flow range, trip and price: the only source of figures |
| `lib/model.ts` | the rules, with no imports: class at a flow, water status, elevation, quotes, who may ride |
| `lib/state.ts` | the visitor's choices (gauge, group) live in the URL, never in storage |
| `components/RiverProfile.tsx` | the river drawn in real pixels, with a raft you can run down it |
| `scripts/check.mjs` | the gate: recomputes every figure from the data and compares it with the exported HTML |
| `vercel.json` | security headers; `style-src 'self'` (no inline styles) |

The formula: `class = base + sensitivity × log2(flow ÷ reference flow)`, clamped to I to V+ and shown to the nearest half class. Every rapid's base and sensitivity is printed on the About page.

## The previous version

The first version of this repository was the unmodified create-next-app starter with a rafting logo that did not exist and a Book Now link to a page that did not exist. It is kept on the branch `legacy/original-boilerplate`.

## Licence

MIT. See `LICENSE`.
