// Serves out/ locally with the headers from vercel.json, so a CSP violation shows up here before it ships.  node scripts/serve.mjs [port]
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const out = path.join(root, 'out')
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'))
const headers = Object.fromEntries(cfg.headers.flatMap((h) => h.headers.map((x) => [x.key, x.value])))
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.txt': 'text/plain', '.ico': 'image/x-icon', '.png': 'image/png' }
const port = +process.argv[2] || 8140
http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0])
  let f = path.join(out, p)
  if (!f.startsWith(out)) { res.writeHead(403); return res.end() }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html')
  if (!fs.existsSync(f)) { f = path.join(out, '404.html'); res.statusCode = 404 } else res.statusCode = 200
  res.writeHead(res.statusCode, { ...headers, 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' })
  fs.createReadStream(f).pipe(res)
}).listen(port, () => console.log('http://localhost:' + port))
