import { createServer } from 'http'
import { readFileSync, existsSync } from 'fs'
import { join, extname } from 'path'

const PORT = process.env.PORT || 3000
const DIST = new URL('./dist', import.meta.url).pathname

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

createServer((req, res) => {
  let filePath = join(DIST, req.url.split('?')[0])
  if (!existsSync(filePath) || filePath === DIST) filePath = join(DIST, 'index.html')
  const ext = extname(filePath)
  const type = mime[ext] || 'application/octet-stream'
  res.writeHead(200, { 'Content-Type': type })
  res.end(readFileSync(filePath))
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`)
})
