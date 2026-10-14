// TEMPORARY (preview only): mirrors seeratali.netlify.app into public/_probe/ so its
// project media can be inspected and then copied into this repo. Removed afterwards.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
const ORIGIN = 'https://seeratali.netlify.app';
const OUT = 'public/_probe';
const seen = new Map(); const queue = ['/'];
const TEXT = /\.(html?|js|mjs|css|json|svg|txt|webmanifest)$/i;
const ASSET = /["'`(\s,]((?:\.{0,2}\/)?[\w\-./%@]+\.(?:png|jpe?g|webp|gif|svg|avif|mp4|webm|mov|pdf|js|mjs|css|json|woff2?))(?:[?#][^"'`)\s]*)?/gi;
function dims(b) {
  if (b[0] === 0x89 && b[1] === 0x50) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b[0] === 0xff && b[1] === 0xd8) { let i = 2; while (i < b.length) { if (b[i] !== 0xff) { i++; continue; } const m = b[i + 1]; if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]; i += 2 + b.readUInt16BE(i + 2); } }
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') { const t = b.toString('ascii', 12, 16); if (t === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)]; if (t === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff]; if (t === 'VP8L') { const n = b.readUInt32LE(21); return [1 + (n & 0x3fff), 1 + ((n >> 14) & 0x3fff)]; } }
  return null;
}
while (queue.length && seen.size < 800) {
  const p = queue.shift(); if (seen.has(p)) continue;
  try {
    const r = await fetch(ORIGIN + p); if (!r.ok) { seen.set(p, { status: r.status }); continue; }
    const b = Buffer.from(await r.arrayBuffer());
    const file = p === '/' ? '/index.html' : decodeURIComponent(p);
    const dest = join(OUT, 'files', file); await mkdir(dirname(dest), { recursive: true }); await writeFile(dest, b);
    const info = { status: 200, bytes: b.length, type: r.headers.get('content-type'), size: dims(b) };
    seen.set(p, info);
    if (TEXT.test(file) || /html|javascript|css|json/.test(info.type || '')) {
      const s = b.toString('utf8');
      await writeFile(join(OUT, 'text', file.replace(/\//g, '__') + '.txt'), s).catch(async () => { await mkdir(join(OUT, 'text'), { recursive: true }); await writeFile(join(OUT, 'text', file.replace(/\//g, '__') + '.txt'), s); });
      for (const m of s.matchAll(ASSET)) {
        let u = m[1]; if (/^\/\//.test(u)) continue;
        try { const abs = new URL(u, ORIGIN + p); if (abs.origin === ORIGIN && !seen.has(abs.pathname)) queue.push(abs.pathname); } catch {}
      }
    }
  } catch (e) { seen.set(p, { error: String(e) }); }
}
await mkdir(OUT, { recursive: true });
const list = [...seen].map(([p, i]) => `${p}\t${i.status || i.error}\t${i.bytes || ''}\t${i.size ? i.size.join('x') : ''}\t${i.type || ''}`).join('\n');
await writeFile(join(OUT, 'manifest.txt'), list + '\n');
console.log(list);
