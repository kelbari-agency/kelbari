// Password gate for the Kelbari Document Studio.
// The password is read from the STUDIO_PASSWORD environment variable (set in Netlify,
// never in the repo). A correct password sets a short-lived signed cookie; the app HTML
// is only ever served to an authenticated request.
// Note: after adding or changing STUDIO_PASSWORD in Netlify, trigger a deploy so the
// new value is picked up by this function.
import crypto from 'node:crypto';
import { APP_B64 } from './_studio_app.mjs';

export const config = { path: '/studio' };

const APP = Buffer.from(APP_B64, 'base64').toString('utf8');
const TTL = 12 * 3600; // 12 hours
const SEC = {
  'X-Robots-Tag': 'noindex, nofollow',
  'Cache-Control': 'no-store, max-age=0',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
};
const HTML = (extra = {}) => ({ 'content-type': 'text/html; charset=utf-8', ...SEC, ...extra });

function sign(exp, key) { return crypto.createHmac('sha256', key).update(String(exp)).digest('hex'); }
function mintToken(key) { const exp = Math.floor(Date.now() / 1000) + TTL; return exp + '.' + sign(exp, key); }
function validToken(tok, key) {
  if (!tok) return false;
  const dot = tok.indexOf('.');
  if (dot < 0) return false;
  const exp = parseInt(tok.slice(0, dot), 10);
  const sig = tok.slice(dot + 1);
  if (!exp || exp < Math.floor(Date.now() / 1000)) return false;
  const good = sign(exp, key);
  if (sig.length !== good.length) return false;
  try { return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good)); } catch { return false; }
}
function samePassword(input, key) {
  const a = Buffer.from(String(input || ''), 'utf8');
  const b = Buffer.from(String(key || ''), 'utf8');
  if (a.length !== b.length) return false;
  try { return crypto.timingSafeEqual(a, b); } catch { return false; }
}
function cookies(req) {
  const out = {};
  (req.headers.get('cookie') || '').split(/;\s*/).forEach((c) => {
    if (!c) return; const i = c.indexOf('='); if (i < 0) return;
    out[c.slice(0, i)] = decodeURIComponent(c.slice(i + 1));
  });
  return out;
}

function loginPage(error) {
  const K = '<svg viewBox="6 4 52 56" width="52" height="52"><g stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"><path d="M14 12V52"/><path d="M14 32L48 12"/><path d="M14 32L48 52"/></g><circle cx="14" cy="12" r="6" fill="#fff"/><circle cx="14" cy="52" r="6" fill="#fff"/><circle cx="48" cy="12" r="6" fill="#8B88FF"/><circle cx="48" cy="52" r="6" fill="#8B88FF"/><circle cx="14" cy="32" r="5" fill="#12133B" stroke="#fff" stroke-width="3"/></svg>';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><title>Kelbari Document Studio — Sign in</title><style>
*{box-sizing:border-box}html,body{margin:0;height:100%}
body{background:#12133B;color:#fff;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;display:grid;place-items:center;padding:24px;
background-image:radial-gradient(45% 45% at 80% 15%,rgba(139,136,255,.28),transparent 70%),radial-gradient(45% 50% at 10% 100%,rgba(59,54,244,.35),transparent 70%)}
.box{width:100%;max-width:380px;text-align:center}
.mark{display:inline-flex;margin-bottom:18px}
h1{font-size:26px;letter-spacing:-.02em;margin:0 0 6px}
p{color:#B8B9D6;font-size:14px;line-height:1.5;margin:0 0 24px}
form{display:flex;flex-direction:column;gap:12px}
input{width:100%;padding:15px 16px;border-radius:12px;border:1.5px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;font-size:16px}
input::placeholder{color:#8486Ae}
input:focus{outline:none;border-color:#8B88FF}
button{width:100%;padding:15px 16px;border:0;border-radius:999px;background:#8B88FF;color:#12133B;font-size:16px;font-weight:700;cursor:pointer}
button:hover{filter:brightness(1.05)}
.err{color:#FF9DB1;font-size:13.5px;margin-bottom:4px;min-height:18px}
.ft{margin-top:22px;color:#6E7098;font-size:12px}
</style></head><body><div class="box">
<div class="mark">${K}</div>
<h1>Kelbari Document Studio</h1>
<p>Enter the team password to make internship certificates, offer letters and recommendation letters.</p>
<div class="err">${error ? error : ''}</div>
<form method="POST" action="/studio" autocomplete="off">
<input type="password" name="password" placeholder="Team password" autofocus aria-label="Team password">
<button type="submit">Unlock</button>
</form>
<div class="ft">Kelbari · Bahawalpur, Pakistan · kelbari.net</div>
</div></body></html>`;
}

export default async (req) => {
  const key = process.env.STUDIO_PASSWORD;
  if (!key) {
    return new Response('Document Studio is not set up yet. An admin needs to add the STUDIO_PASSWORD environment variable in Netlify.', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8', ...SEC } });
  }
  if (req.method === 'POST') {
    let pass = '';
    try { const f = await req.formData(); pass = f.get('password') || ''; }
    catch { try { pass = new URLSearchParams(await req.text()).get('password') || ''; } catch {} }
    if (samePassword(pass, key)) {
      const cookie = `kds=${mintToken(key)}; HttpOnly; Secure; SameSite=Strict; Path=/studio; Max-Age=${TTL}`;
      return new Response(APP, { status: 200, headers: HTML({ 'Set-Cookie': cookie }) });
    }
    return new Response(loginPage('Incorrect password. Please try again.'), { status: 401, headers: HTML() });
  }
  if (validToken(cookies(req).kds, key)) {
    return new Response(APP, { status: 200, headers: HTML() });
  }
  return new Response(loginPage(''), { status: 200, headers: HTML() });
};
