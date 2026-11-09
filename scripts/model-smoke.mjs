import { classAt, classLabel, waterStatus, quote, elevation } from '../lib/model.ts'
console.log(classLabel(classAt({ name: 'x', mile: 1, base: 3, sens: 0.8, dropFt: 1 }, 1200, 2400)), waterStatus({ minCfs: 600, maxCfs: 4500 }, 1200), quote(135, 8, [{ from: 8, pct: 10 }, { from: 4, pct: 5 }], 25))
