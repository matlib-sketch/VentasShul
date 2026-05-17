import { createServer } from 'http'
import { readFileSync, existsSync, statSync } from 'fs'
import { join, extname } from 'path'

const PORT = process.env.PORT || 3000
const DIST = new URL('./dist', import.meta.url).pathname
const INDEX = join(DIST, 'index.html')

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function resolveFile(reqUrl) {
  const candidate = join(DIST, reqUrl.split('?')[0])
  if (!candidate.startsWith(DIST)) return INDEX
  if (!existsSync(candidate)) return INDEX
  if (statSync(candidate).isDirectory()) return INDEX
  return candidate
}

createServer((req, res) => {
  try {
    const filePath = resolveFile(req.url)
    const type = mime[extname(filePath)] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': type })
    res.end(readFileSync(filePath))
  } catch (err) {
    console.error('Request error:', err)
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
  }
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`)
})
