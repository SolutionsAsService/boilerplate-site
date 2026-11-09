// The gate: npm run verify (next build, then this).  Reads the exported site in out/ and the model in lib/model.ts.
//  - pages: titles that begin with the nav label, one h1, descriptions, every internal link resolves, no external request, no inline style attribute
//  - the model: class at a flow, class labels, water status, elevation, quotes and eligibility recomputed independently from data/*.json
//  - printed figures: the numbers in the exported HTML (about table, river cards, trip prices) equal the recomputed ones
//  - the theme: contrast of every text/background pair in both schemes and at the ends of the flow colour range; SVG text sizes
//  - vercel.json: the headers, and a content security policy without eval or wildcards
import fs from 'node:fs'
import path from 'node:path'
import * as M from '../lib/model.ts'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const out = path.join(root, 'out')
const problems = []
const bad = (m) => problems.push(m)
const J = (f) => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'))
const rivers = J('data/rivers.json'), trips = J('data/trips.json')
const near = (a, b, tol, what) => { if (!(Math.abs(a - b) <= tol)) bad(`${what}: got ${a}, expected ${b} +-${tol}`) }
if (!fs.existsSync(out)) { console.error('No out/ folder: run `next build` first (npm run verify does both).'); process.exit(1) }

// ---------------------------------------------------------------- the model, recomputed independently
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V']
const label = (x) => { const h = Math.round(x * 2) / 2, w = Math.floor(h); return ROMAN[w] + (h - w === 0.5 ? '+' : '') }
const refClass = (r, rv, f) => Math.min(5.5, Math.max(1, r.base + r.sens * (Math.log(f / rv.refCfs) / Math.log(2))))
for (const rv of rivers.rivers) {
  for (const f of [200, 400, 600, 1200, 2200, 3000, 4500, 7000]) for (const r of rv.rapids) {
    near(M.classAt(r, rv.refCfs, f), refClass(r, rv, f), 1e-9, `${rv.id}/${r.name} class at ${f}`)
    if (M.classLabel(refClass(r, rv, f)) !== label(refClass(r, rv, f))) bad(`class label differs at ${f} for ${r.name}`)
  }
  for (const r of rv.rapids) { near(M.classAt(r, rv.refCfs, rv.refCfs), Math.min(5.5, Math.max(1, r.base)), 1e-12, `${r.name} class at its reference flow is its base`); if (M.classAt(r, rv.refCfs, rv.refCfs * 2) < M.classAt(r, rv.refCfs, rv.refCfs) - 1e-12) bad(`${r.name}: a higher flow must not lower the class`) }
  // elevation: starts at the put-in, ends at the take-out, never rises, and the drops add up
  near(M.elevation(rv, 0), rv.startFt, 1e-6, `${rv.id} put-in elevation`); near(M.elevation(rv, rv.miles), rv.endFt, 1e-6, `${rv.id} take-out elevation`)
  let prev = Infinity; for (let m = 0; m <= rv.miles; m += 0.05) { const e = M.elevation(rv, m); if (e > prev + 1e-9) bad(`${rv.id}: the river runs uphill at mile ${m.toFixed(2)}`); prev = e }
  const dropSum = rv.rapids.reduce((s, r) => s + r.dropFt, 0); if (dropSum >= rv.startFt - rv.endFt) bad(`${rv.id}: the rapids drop more than the whole river`)
  for (const r of rv.rapids) if (r.mile < 0.3 || r.mile > rv.miles - 0.3) bad(`${rv.id}/${r.name}: the rapid sits at the end of the river, where its drop would be clipped`)
  // water status boundaries
  const w = (f) => M.waterStatus(rv, f)
  const hardestAt = (f) => Math.max(...rv.rapids.map((r) => refClass(r, rv, f)))
  const expect = (f) => (f > rv.maxCfs ? 'closed' : f < rv.minCfs ? 'low' : f > rv.minCfs + 0.8 * (rv.maxCfs - rv.minCfs) || hardestAt(f) >= 4.5 ? 'pushy' : 'good')
  for (let f = 100; f <= 8000; f += 25) if (w(f) !== expect(f)) bad(`${rv.id}: water status at ${f} is ${w(f)}, expected ${expect(f)}`)
  if (w(rv.minCfs - 1) !== 'low' || w(rv.maxCfs + 1) !== 'closed' || w(rv.maxCfs) !== 'pushy') bad(`${rv.id}: water status boundaries`)
  near(M.hardest(rv, 1500), hardestAt(1500), 1e-9, `${rv.id} hardest at 1500`); if (M.hardestRapid(rv, 1500).name !== rv.rapids.reduce((a, b) => (refClass(b, rv, 1500) > refClass(a, rv, 1500) ? b : a)).name) bad(`${rv.id}: hardestRapid`)
  if (rv.monthlyCfs.length !== 12) bad(`${rv.id}: needs 12 monthly flows`)
  if (!(rv.minCfs < rv.refCfs && rv.refCfs < rv.maxCfs)) bad(`${rv.id}: the reference flow must be inside the runnable range`)
}
if (M.classLabel(2.74) !== 'II+' || M.classLabel(2.76) !== 'III' || M.classLabel(2.25) !== 'II+' || M.classLabel(5.5) !== 'V+' || M.classLabel(1) !== 'I' || M.classLabel(3.5) !== 'III+') bad('class labels: ' + [2.74, 2.76, 2.25, 5.5, 1, 3.5].map(M.classLabel).join(' '))
// quotes
for (const t of trips.trips) for (const n of [1, 3, 4, 7, 8, 20]) {
  const pct = n >= 8 ? 10 : n >= 4 ? 5 : 0, total = Math.round(t.price * n * (100 - pct)) / 100, q = M.quote(t.price, n, trips.discount, trips.depositPct)
  near(q.total, total, 1e-9, `${t.slug} total for ${n}`); near(q.perPerson, total / n, 1e-9, `${t.slug} per person for ${n}`); near(q.gross, t.price * n, 0, `${t.slug} gross for ${n}`); near(q.deposit, Math.ceil(total * 0.25), 0, `${t.slug} deposit for ${n}`); near(q.pct, pct, 0, `${t.slug} discount for ${n}`)
}
if (trips.depositPct !== 25) bad('the deposit is pinned at 25% (the About page says so)')
// eligibility: age, weight, experience, the water, and the class of the hardest rapid at that flow
{
  const rv = Object.fromEntries(rivers.rivers.map((r) => [r.id, r]))
  const g = (o) => ({ n: 4, age: 30, lb: 180, exp: 'iii', ...o })
  const fits = (id, o, f) => !M.blockers(rv[id], g(o), f).length
  if (!fits('granite-run', { age: 14, lb: 120, exp: 'some' }, 1200)) bad('a 14 year old of 120 lb with some experience should fit Granite Run at 1,200: ' + M.blockers(rv['granite-run'], g({ age: 14, lb: 120, exp: 'some' }), 1200).join(' '))
  if (fits('granite-run', { age: 11, lb: 120, exp: 'some' }, 1200)) bad('an 11 year old must not fit Granite Run')
  if (!fits('granite-run', { age: 14, lb: 70, exp: 'some' }, 1200) || fits('granite-run', { age: 14, lb: 69, exp: 'some' }, 1200)) bad('Granite Run: 70 lb fits, 69 lb does not (the limits are inclusive)')
  if (!fits('granite-run', { age: 12, lb: 70, exp: 'some' }, 1000)) bad('exactly 12 years and 70 lb fit Granite Run at 1,000')
  if (fits('black-narrows', { exp: 'some' }, 2200)) bad('Black Narrows needs class III experience')
  if (!fits('black-narrows', { exp: 'iii' }, 2200)) bad('an experienced adult should fit Black Narrows at 2,200')
  if (!M.blockers(rv['elk-fork'], g({ exp: 'none' }), 3000).some((s) => /closed/.test(s))) bad('Elk Fork is closed at 3,000')
  if (!M.blockers(rv['elk-fork'], g({ exp: 'none' }), 250).some((s) => /too low/.test(s))) bad('Elk Fork is too low at 250')
  // the class ceiling: the class shown (rounded to a half) must not pass the group's limit, and the refusal names the rapid and the limit
  const kid = { age: 5, lb: 40, exp: 'none' }
  if (!fits('elk-fork', kid, 600) || !fits('elk-fork', kid, 1200) || !fits('elk-fork', kid, 2500)) bad('Elk Fork is a river a 5 year old with no experience can ride across its whole runnable range (hardest rapid II+)')
  const why = M.blockers(rv['granite-run'], g({ age: 9, exp: 'iii' }), 2000); if (!why.some((s) => /Dentist's Chair/.test(s) && /class IV/.test(s) && /limit is class II\+/.test(s))) bad('a 9 year old at 2,000 cfs on Granite Run must be refused for Dentist\'s Chair (class IV), with the limit II+ named: ' + why.join(' | '))
  if (fits('granite-run', { age: 12, lb: 120, exp: 'some' }, 3000)) bad('a 12 year old must not be sent down Granite Run at 3,000 cfs (Dentist\'s Chair is class V)')
  if (!fits('granite-run', { age: 30, lb: 180, exp: 'iii' }, 3000)) bad('an experienced adult fits Granite Run at 3,000 cfs')
  near(M.hardest(rv['granite-run'], 3000), refClass(rv['granite-run'].rapids[2], rv['granite-run'], 3000), 1e-9, 'hardest of Granite Run at 3,000')
  if (!/\(cap\)/.test(M.hardestShown(rv['black-narrows'], 6000)) || /\(cap\)/.test(M.hardestShown(rv['granite-run'], 1200))) bad('hardestShown flags only capped values')
  // ceilings
  for (const [o, cap] of [[{ age: 30, exp: 'none' }, 2.5], [{ age: 30, exp: 'some' }, 4], [{ age: 30, exp: 'iii' }, 5.5], [{ age: 9, exp: 'iii' }, 2.5], [{ age: 10, exp: 'iii' }, 3.5], [{ age: 13, exp: 'iii' }, 3.5], [{ age: 14, exp: 'iii' }, 5.5], [{ age: 14, exp: 'some' }, 4]]) near(M.classCeiling(g(o)), cap, 0, `class ceiling for ${JSON.stringify(o)}`)
  // a class above the cap is flagged, never printed as if measured
  const maw = rv['black-narrows'].rapids[2]; if (!/\(cap\)/.test(M.classShown(maw, 2200, 6000)) || /\(cap\)/.test(M.classShown(maw, 2200, 2200))) bad('classShown flags only capped values')
}
near(M.flowFraction(200, 200, 7000), 0, 1e-12, 'flow fraction at the minimum'); near(M.flowFraction(7000, 200, 7000), 1, 1e-12, 'flow fraction at the maximum'); near(M.flowFraction(1183.2, 200, 7000), 0.5, 1e-3, 'flow fraction is logarithmic')

// ---------------------------------------------------------------- pages
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? (e.name === '_next' ? [] : walk(path.join(d, e.name))) : [path.join(d, e.name)])
const files = walk(out), htmls = files.filter((f) => f.endsWith('.html'))
const rel = (f) => path.relative(out, f)
const text = (h) => h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ')
const NAV = [['trips', 'Trips'], ['plan', 'Find a trip'], ['safety', 'Safety'], ['about', 'About'], ['contact', 'Contact'], ['book-now', 'Request a trip']]
const exists = (u) => { const p = decodeURIComponent(u.split('#')[0].split('?')[0]); if (!p || p === '/') return true; const f = path.join(out, p); return fs.existsSync(f) && (fs.statSync(f).isFile() || fs.existsSync(path.join(f, 'index.html'))) }
const titles = []
for (const f of htmls) {
  const p = rel(f), h = fs.readFileSync(f, 'utf8'), t = text(h)
  if (p === '404.html' || p.startsWith('_not-found') || p.startsWith('404/')) continue
  const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || ''; titles.push(title.replace(/&amp;/g, '&'))
  if (!/^<!DOCTYPE html>/i.test(h) || !/<html[^>]*lang="en"/.test(h)) bad(`${p}: doctype and lang`)
  if (!/<meta name="description" content="[^"]{40,}"/.test(h)) bad(`${p}: a description of at least 40 characters`)
  if ((h.match(/<h1[\s>]/g) || []).length !== 1) bad(`${p}: needs exactly one h1`)
  if (title.length > 72) bad(`${p}: the title is ${title.length} characters`)
  const dir = p.split('/')[0]; const nav = NAV.filter(([d]) => d === dir)[0]
  if (nav && !title.startsWith(nav[1] + ':')) bad(`${p}: the title "${title}" must begin with the nav label "${nav[1]}:"`)
  if (p === 'index.html' && !/^Gauge Rafting: /.test(title)) bad(`index.html: the title "${title}"`)
  if (!/<a class="skip" href="#main"/.test(h) || !/<main id="main"/.test(h)) bad(`${p}: skip link and main landmark`)
  if (/<[a-z][^>]*\sstyle="/.test(h)) bad(`${p}: inline style attribute`)
  if (/<style[\s>]/.test(h)) bad(`${p}: inline style element`)
  for (const m of h.matchAll(/(?:href|src|action)="([^"]+)"/g)) {
    const u = m[1]
    if (/^https?:\/\//.test(u)) { if (u !== 'https://github.com/SolutionsAsService/boilerplate-site') bad(`${p}: external link or request ${u}`); continue }
    if (/^(mailto:|#|data:)/.test(u)) continue
    if (!u.startsWith('/')) { bad(`${p}: relative url ${u}`); continue }
    if (!exists(u)) bad(`${p}: broken link ${u}`)
  }
  for (const id of [...h.matchAll(/href="#([^"]+)"/g)].map((m) => m[1])) if (id !== 'main' && !new RegExp(`id="${id}"`).test(h)) bad(`${p}: anchor #${id} has no target`)
  for (const w of ['complete guide', 'world-class', 'unforgettable', 'once-in-a-lifetime', 'adrenaline junkie', 'safest', '100% safe', 'guaranteed']) if (new RegExp(w, 'i').test(t)) bad(`${p}: banned claim "${w}"`)
  if (!/demonstration/i.test(t)) bad(`${p}: the demonstration notice must appear on every page (footer)`)
}
if (new Set(titles).size !== titles.length) bad('two pages share a title: ' + titles.filter((t, i) => titles.indexOf(t) !== i).join(' / '))
const expected = ['index.html', 'trips/index.html', 'plan/index.html', 'safety/index.html', 'about/index.html', 'contact/index.html', 'book-now/index.html', 'trips/elk-fork-float/index.html', 'trips/elk-fork-full-day/index.html', 'trips/granite-run-day/index.html', 'trips/granite-run-overnight/index.html', 'trips/black-narrows-expert/index.html', '404.html']
for (const e of expected) if (!fs.existsSync(path.join(out, e))) bad(`missing page ${e}`)
if (trips.trips.length !== 5) bad('five trips are promised in the copy')
for (const t of trips.trips) if (!rivers.rivers.some((r) => r.id === t.river)) bad(`${t.slug}: unknown river`)

// ---------------------------------------------------------------- the printed figures
{
  const about = text(fs.readFileSync(path.join(out, 'about/index.html'), 'utf8'))
  for (const rv of rivers.rivers) for (const r of rv.rapids) {
    const shown = (f) => label(refClass(r, rv, f)) + (r.base + r.sens * Math.log2(f / rv.refCfs) > 5.5 + 1e-9 ? ' (cap)' : '')
    const row = `${rv.name} ${r.name} ${r.base} ${r.sens} ${shown(rv.refCfs / 2)} ${shown(rv.refCfs)} ${shown(rv.refCfs * 2)}`
    if (!about.includes(row)) bad(`about: the table row for ${r.name} should read "${row}"`)
  }
  const homeRaw = fs.readFileSync(path.join(out, 'index.html'), 'utf8'), home = text(homeRaw)
  for (const rv of rivers.rivers) { const s = `${rv.miles} miles (${Math.round(rv.miles * 1.609)} km) · riders ${rv.minAge}+ and ${rv.minLb} lb+ · runs from ${rv.minCfs.toLocaleString('en-US')} to ${rv.maxCfs.toLocaleString('en-US')} cfs`; if (!home.includes(s)) bad(`home: the card for ${rv.name} should say "${s}"`) }
  const tp = text(fs.readFileSync(path.join(out, 'trips/index.html'), 'utf8'))
  for (const t of trips.trips) if (!tp.includes(`$${t.price} per person`)) bad(`trips: the price of ${t.title} should print as $${t.price} per person`)
  for (const t of trips.trips) {
    const rv = rivers.rivers.find((r) => r.id === t.river), page = text(fs.readFileSync(path.join(out, `trips/${t.slug}/index.html`), 'utf8'))
    if (!page.includes(`Riders must be ${rv.minAge} or older and weigh at least ${rv.minLb} lb`)) bad(`${t.slug}: the rider limits should read ${rv.minAge} and ${rv.minLb} lb`)
    const hours = t.days > 1 ? `${t.days} days` : `${t.hours} hours`; if (!page.includes(hours)) bad(`${t.slug}: should say ${hours}`)
  }
  if (!/5% from four people and 10% from eight/.test(about) || !/25% of the total/.test(about)) bad('about: the discount and deposit rules must match trips.json')
  if (!/class II\+ with no experience, III\+ with a few easy trips, V\+ with class III experience; and II\+ under age 10, III\+ under age 14/.test(about)) bad('about: the class ceilings printed must match EXP_CAP and the age caps')
  if (!/cubic feet per second/.test(home) && !/cubic feet per second/.test(about)) bad('cfs must be defined in visible text')
}

// ---------------------------------------------------------------- the theme
const css = fs.readFileSync(path.join(root, 'app/globals.css'), 'utf8')
const tokens = (block) => Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)].map((m) => [m[1], m[2]]))
const light = tokens(css.match(/:root \{([\s\S]*?)\n\}/)[1]), darkOver = tokens(css.match(/prefers-color-scheme: dark\) \{\s*:root \{([\s\S]*?)\}\s*\}/)[1])
const dark = { ...light, ...darkOver }
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) }
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const lum = (h) => { const [r, g, b] = rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
// oklab mix, as CSS color-mix(in oklab, a p%, b)
const toOk = (h) => { const [r, g, b] = rgb(h).map(lin); const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b); return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s] }
const fromOk = ([L, a, b]) => { const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3), m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3), s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3); const c = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map((v) => Math.min(1, Math.max(0, v))); return '#' + c.map((v) => Math.round((v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255).toString(16).padStart(2, '0')).join('') }
const mix = (a, pa, b) => { const x = toOk(a), y = toOk(b); return fromOk(x.map((v, i) => v * pa + y[i] * (1 - pa))) }
for (const [scheme, t] of [['light', light], ['dark', dark]]) {
  const pairs = [['ink', 'bg', 4.5], ['ink', 'card', 4.5], ['ink2', 'bg', 4.5], ['ink2', 'card', 4.5], ['on-hi', 'hi', 4.5], ['on-btn', 'btn', 4.5], ['on-hdr', 'hdr', 4.5], ['hi', 'hdr', 4.5], ['on-ok', 'ok', 4.5], ['on-bad', 'bad', 4.5], ['on-pfd', 'pfd', 4.5], ['bad', 'card', 4.5], ['bad', 'bg', 4.5], ['ok', 'card', 3], ['warn', 'card', 4.5]]
  for (const [a, b, min] of pairs) if (t[a] && t[b] && cr(t[a], t[b]) < min) bad(`globals.css: ${scheme} ${a} on ${b} is ${cr(t[a], t[b]).toFixed(2)}:1 (needs ${min})`)
  for (const [a, b] of [['on-k1', 'k2'], ['on-k3', 'k3'], ['on-k4', 'k4'], ['on-k5', 'k5']]) if (cr(t[a] || light[a], t[b]) < 4.5) bad(`globals.css: ${scheme} ${a} on ${b} is ${cr(t[a] || light[a], t[b]).toFixed(2)}:1`)
  // the heat scale: low to mid by --f1, mid to high by --f2; water-text = water mixed toward the ink (46% light, 72% dark), over the page at every point of the scale
  for (const f of [0, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 1]) {
    const f1 = Math.min(1, 2 * f), f2 = Math.max(0, 2 * f - 1)
    const water = mix(mix(t['w-mid'], f1, t['w-low']), 1 - f2, t['w-high']), wt = mix(water, scheme === 'dark' ? 0.72 : 0.46, t.ink)
    for (const bg of ['bg', 'card']) if (cr(wt, t[bg]) < 4.5) bad(`globals.css: ${scheme} water-text at flow ${f} on ${bg} is ${cr(wt, t[bg]).toFixed(2)}:1 (needs 4.5)`)
    // the hero's wash: the water at 30% over the page (top) and 12% (middle): ink, ink2 and the water-text must stay readable on it
    for (const pct of [0.3, 0.12]) { const wash = mix(water, pct, t.bg); for (const [name, fg] of [['ink', t.ink], ['ink2', t.ink2], ['water-text', wt]]) if (cr(fg, wash) < 4.5) bad(`globals.css: ${scheme} ${name} on the hero wash (${pct * 100}% water) at flow ${f} is ${cr(fg, wash).toFixed(2)}:1 (needs 4.5)`) }
  }
}
if (!/--water:\s*color-mix\(in oklab,\s*color-mix\(in oklab,\s*var\(--w-mid\) calc\(var\(--f1\)[^;]*var\(--w-low\)\)[^;]*var\(--w-high\)\)/.test(css)) bad('globals.css: --water must be the three-stop heat scale low, mid, high')
  { const th = fs.readFileSync(path.join(root, 'components/Theme.tsx'), 'utf8'); if (!/Math\.min\(1, 2 \* f\)/.test(th) || !/Math\.max\(0, 2 \* f - 1\)/.test(th)) bad('Theme.tsx: --f1 and --f2 must be min(1, 2f) and max(0, 2f - 1)') }
{
  const prof = fs.readFileSync(path.join(root, 'components/RiverProfile.tsx'), 'utf8')
  if (!/viewBox=\{`0 0 \$\{W\} \$\{H\}`\}/.test(prof) || !/width=\{W\}/.test(prof) || !/Math\.max\(280/.test(prof)) bad('RiverProfile: the picture must be drawn in pixels from the container width (minimum 280)')
  const sizes = [...css.matchAll(/\.profile (?:text|\.num|\.rn|\.veilt)[^{]*\{[^}]*?font(?:-size)?:\s*(?:[0-9]+ )?(\d+)px/g)].map((m) => +m[1]); if (!sizes.length || sizes.some((z) => z < 12)) bad(`globals.css: SVG text under 12 px (${sizes.join(', ')})`)
}

// ---------------------------------------------------------------- deploy config
{
  const v = J('vercel.json'), hs = Object.fromEntries((v.headers || []).flatMap((h) => h.headers.map((x) => [x.key, x.value])))
  for (const k of ['Content-Security-Policy', 'X-Content-Type-Options', 'Referrer-Policy', 'Strict-Transport-Security']) if (!hs[k]) bad(`vercel.json: missing ${k}`)
  const csp = hs['Content-Security-Policy'] || ''
  if (/unsafe-eval|\*/.test(csp)) bad('vercel.json: the CSP allows eval or a wildcard')
  if (/style-src[^;]*unsafe-inline/.test(csp)) bad('vercel.json: style-src must not allow inline styles')
  if (!/default-src 'none'/.test(csp)) bad("vercel.json: the CSP starts from default-src 'none'")
  if ((v.rewrites || []).length) bad('vercel.json: no rewrites (unknown paths must 404)')
}
const pkg = J('package.json'); if (!/^15\./.test(pkg.dependencies.next) || !/^19\./.test(pkg.dependencies.react)) bad('package.json: Next 15 and React 19 are pinned')
if (!fs.existsSync(path.join(root, 'package-lock.json'))) bad('package-lock.json must be committed so that npm ci works')

if (problems.length) { console.error(problems.join('\n')); process.exit(1) }
console.log(`OK: ${htmls.length} pages, ${rivers.rivers.length} rivers, ${rivers.rivers.reduce((s, r) => s + r.rapids.length, 0)} rapids, ${trips.trips.length} trips recomputed and compared with the exported HTML`)
