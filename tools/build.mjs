// Kelbari production build: public/ (source, edited by hand and by the CMS) → dist/ (published by Netlify).
//
//  1. Copies public/ to dist/.
//  2. Makes responsive WebP sizes of project covers and gallery images.
//  3. Renders the project cards into the home page (crawlable, no layout shift) and embeds their data.
//  4. Generates a page per service (/web-development/ …) and per gallery project (/work/<slug>/).
//  5. Builds the blog from tools/content/blog/*.md: /blog/, one page per article, an RSS feed,
//     and a Guides list on the service pages. Writes sitemap.xml.
//  6. Bundles and minifies the JavaScript into one fingerprinted file, inlines the minified CSS,
//     and minifies every HTML page.
//
// Run: npm run build   (Netlify runs it on every deploy; no secrets involved.)

import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, extname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import sharp from 'sharp';
import { minify as minifyHtml } from 'html-minifier-terser';
import { Marked } from 'marked';
import YAML from 'yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'public');
const OUT = join(ROOT, 'dist');
const SITE = 'https://kelbari.net';
const TODAY = new Date().toISOString().slice(0, 10);

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const exists = (p) => stat(p).then(() => true, () => false);
const ARROW = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ARROW_OUT = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11L11 5M6 5h5v5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CARD_SIZES = '(max-width: 760px) calc(100vw - 52px), (max-width: 1180px) 45vw, 380px';
const GALLERY_SIZES = '(max-width: 1180px) 100vw, 1116px';
const log = (...a) => console.log('[build]', ...a);

/* ---------- 1. fresh copy ---------- */
await rm(OUT, { recursive: true, force: true });
await cp(SRC, OUT, { recursive: true });

/* ---------- 2. responsive images ---------- */
const variants = new Map(); // "/images/…/x.jpg" -> { src, srcset }
async function responsive(url, widths) {
  if (!url || !url.startsWith('/') || variants.has(url)) return variants.get(url);
  const file = join(SRC, url);
  if (!(await exists(file))) return undefined;
  const img = sharp(file);
  const { width } = await img.metadata();
  const base = url.slice(0, -extname(url).length);
  const set = [];
  for (const w of widths.filter((x) => x < width)) {
    const out = `${base}-${w}.webp`;
    await sharp(file).resize({ width: w }).webp({ quality: 74, effort: 5 }).toFile(join(OUT, out));
    set.push([out, w]);
  }
  // full-width WebP (or the original if it already is one)
  let full = url;
  if (!/\.webp$/i.test(url)) {
    full = `${base}.webp`;
    await sharp(file).webp({ quality: 76, effort: 5 }).toFile(join(OUT, full));
  }
  set.push([full, width]);
  const v = { src: set.find(([, w]) => w >= 800)?.[0] || full, srcset: set.map(([u, w]) => `${u} ${w}w`).join(', ') };
  variants.set(url, v);
  return v;
}

const data = JSON.parse(await readFile(join(SRC, 'data/projects.json'), 'utf8'));
const projects = (data.projects || []).filter((p) => p && p.title);
const slugOf = (p) => (/^[a-z0-9-]+$/.test(p.slug || '') ? p.slug : '');
const galleryOf = (p) => (p.gallery || []).filter((g) => g && g.image);
const isGallery = (p) => slugOf(p) && galleryOf(p).length;

for (const p of projects) {
  const v = await responsive(p.image, [480, 800, 1200]);
  if (v) { p.image_src = v.src; p.image_srcset = v.srcset; }
  for (const g of galleryOf(p)) {
    const gv = await responsive(g.image, [800]);
    if (gv) g.srcset = gv.srcset;
  }
}
log('images:', variants.size, 'responsive sets');

/* ---------- shared page parts, taken from the home page so there is one source ---------- */
let index = await readFile(join(SRC, 'index.html'), 'utf8');
const between = (s, a, b) => { const i = s.indexOf(a); const j = s.indexOf(b, i); if (i < 0 || j < 0) throw new Error(`markers not found: ${a}`); return s.slice(i, j + b.length); };
const symbols = between(index, '<svg width="0" height="0"', '</svg>\n') .replace(/\n$/, '');
// On generated pages, in-page links (<a href="#x">) point back to the home page; <use href="#k-…"> stays local.
const toHome = (html) => html.replace(/(<a\b[^>]*?)href="#([a-z][\w-]*)"/g, (m, a, id) => `${a}href="${id === 'top' ? '/' : `/#${id}`}"`);
const header = toHome(between(index, '<header class="site-header"', '</header>')).replace('aria-label="Kelbari — back to top"', 'aria-label="Kelbari — home"');
const footer = toHome(between(index, '<footer class="site-footer', '</footer>')).replace('aria-label="Kelbari — back to top"', 'aria-label="Kelbari — home"').replace('<a class="f-up" href="/">Back to top</a>', '<a class="f-up" href="#top">Back to top</a>');
const waButton = between(index, '<a class="wa"', '</a>');
const headCommon = [
  between(index, '<link rel="icon"', '<link rel="manifest" href="/site.webmanifest">'),
  ...(index.match(/<link rel="preload"[^>]*>/g) || []),
].join('\n');

function card(p) {
  const slug = slugOf(p), meta = [p.client && p.client !== p.title ? p.client : '', p.location].filter(Boolean).join(' · ');
  let btn = '', link = false;
  if (isGallery(p)) {
    btn = `<a class="btn btn-cobalt pbtn" href="/work/${slug}/" aria-label="View project: ${esc(p.title)}"><span>View project</span>${ARROW}</a>`; link = true;
  } else if (p.link) {
    btn = `<a class="btn btn-cobalt pbtn" href="${esc(p.link)}" target="_blank" rel="noopener" aria-label="View site: ${esc(p.title)} (opens in a new tab)"><span>View site</span>${ARROW_OUT}</a>`; link = true;
  }
  const img = p.image ? `<div class="thumb"><img src="${esc(p.image_src || p.image)}"${p.image_srcset ? ` srcset="${esc(p.image_srcset)}" sizes="${CARD_SIZES}"` : ''} width="1600" height="1000" alt="${esc(p.title)} project" loading="lazy" decoding="async"></div>` : '';
  return `<article class="project${link ? ' is-link' : ''}" data-cat="${esc(p.category || '')}" data-prerendered>${img}<div class="pbody">`
    + (p.category ? `<p class="cat">${esc(p.category)}</p>` : '')
    + `<h3>${esc(p.title)}</h3>`
    + (meta ? `<p class="pmeta">${esc(meta)}</p>` : '')
    + (p.description ? `<p>${esc(p.description)}</p>` : '')
    + ((p.highlights || []).filter(Boolean).length ? `<ul class="phigh">${p.highlights.filter(Boolean).map((h) => `<li>${esc(typeof h === 'string' ? h : h.item)}</li>`).join('')}</ul>` : '')
    + ((p.built_with || []).filter(Boolean).length ? `<div class="pstack"><span class="pstack-label">Built with</span>${p.built_with.filter(Boolean).map((t) => `<span class="ptag">${esc(typeof t === 'string' ? t : t.tool)}</span>`).join('')}</div>` : '')
    + btn + '</div></article>';
}

/* ---------- 3. home page: prerendered cards + embedded data ---------- */
if (projects.length) {
  index = index.replace('<div class="projects" data-projects hidden></div>', `<div class="projects" data-projects>${projects.map(card).join('')}</div>`);
  index = index.replace('<div class="empty" data-empty data-reveal>', '<div class="empty" data-empty data-reveal hidden>');
  const embedded = JSON.stringify({ projects }).replace(/</g, '\\u003c');
  index = index.replace('<script src="/assets/js/hero.js" defer></script>', `<script type="application/json" id="projects-data">${embedded}</script>\n<script src="/assets/js/hero.js" defer></script>`);
}

/* ---------- 3b. home questions → FAQPage structured data (the visible answers are the source) ---------- */
const strip = (h) => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/\s+/g, ' ').trim();
const homeFaq = [...index.matchAll(/<details[^>]*><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)].map((m) => ({ q: strip(m[1]), a: strip(m[2]) }));
if (homeFaq.length) {
  const ld = { '@context': 'https://schema.org', '@type': 'FAQPage', '@id': `${SITE}/#faq`, mainEntity: homeFaq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
  index = index.replace('</head>', `<script type="application/ld+json">${JSON.stringify(ld)}</script>\n</head>`);
}

/* ---------- 4. generated pages ---------- */
function page({ path, title, description, image, jsonld, body, type = 'website' }) {
  const url = `${SITE}${path}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#F8F8FC">
${headCommon}
<link rel="stylesheet" href="/assets/css/styles.css">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="Kelbari">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}${image || '/assets/og-image.png'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE}${image || '/assets/og-image.png'}">
<link rel="alternate" type="application/rss+xml" title="Kelbari Blog" href="/blog/feed.xml">
<script>document.documentElement.className += ' js';</script>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body class="subpage">
<a class="skip" href="#main">Skip to content</a>
${symbols}
${header}
<main id="main">
${body}
</main>
${footer}
${waButton}
<script src="/assets/js/main.js" defer></script>
<script src="/assets/js/cursor.js" defer></script>
<script src="/assets/js/effects.js" defer></script>
</body>
</html>`;
}
const crumbs = (items) => `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items.map(([n, h], i) => i === items.length - 1 ? `<li aria-current="page">${esc(n)}</li>` : `<li><a href="${h}">${esc(n)}</a></li>`).join('')}</ol></nav>`;
const crumbLd = (items) => ({ '@type': 'BreadcrumbList', itemListElement: items.map(([n, h], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: `${SITE}${h}` })) });
const ORG = { '@id': `${SITE}/#org` };
const ctaBand = (h = 'Have a project in mind?', p = 'Send a brief or message us on WhatsApp. Most enquiries get a reply the same day.') =>
  `<section class="cta-band on-dark" aria-labelledby="cta-title"><div class="wrap"><h2 id="cta-title">${esc(h)}</h2><p>${esc(p)}</p><div class="cta"><a class="btn btn-electric btn-lg" href="/#contact">Start a project</a><a class="btn btn-ghost-dark btn-lg" href="https://wa.me/923019233246?text=Hi%20Kelbari%20%E2%80%94%20I%27d%20like%20to%20talk%20about%20a%20project." target="_blank" rel="noopener">Message on WhatsApp</a></div></div></section>`;

const content = JSON.parse(await readFile(join(ROOT, 'tools/content/services.json'), 'utf8'));
const sitemap = [{ loc: '/', priority: '1.0', images: projects.filter((p) => p.image).map((p) => ({ loc: p.image_src || p.image, title: p.title })) }];

/* ---------- blog articles: tools/content/blog/<slug>.md = YAML front matter + Markdown ---------- */
const BLOG_DIR = join(ROOT, 'tools/content/blog');
const FOUNDERS = ['Saqlain Akbar', 'Hafiz Ahmad'];
const isoDay = (d) => (d instanceof Date ? d.toISOString() : String(d || '')).slice(0, 10);
const longDate = (d) => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const slugify = (t) => t.toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const posts = [];
if (await exists(BLOG_DIR)) {
  for (const f of (await readdir(BLOG_DIR)).filter((n) => n.endsWith('.md')).sort()) {
    const raw = await readFile(join(BLOG_DIR, f), 'utf8');
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!m) throw new Error(`blog/${f}: front matter (--- … ---) is missing`);
    const fm = YAML.parse(m[1]) || {};
    if (fm.draft) continue;
    const slug = basename(f, '.md');
    for (const k of ['title', 'description', 'date']) if (!fm[k]) throw new Error(`blog/${f}: "${k}" is missing`);
    if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`blog/${f}: use lowercase letters, numbers and dashes in the file name`);
    const toc = [], ids = new Set();
    const md = new Marked({ gfm: true });
    md.use({ renderer: {
      heading(text, level) {
        let id = slugify(text) || 'section'; while (ids.has(id)) id += '-2'; ids.add(id);
        if (level === 2) toc.push({ id, text });
        return `<h${level} id="${id}">${text}</h${level}>\n`;
      },
      table(header, body) { return `<div class="table-wrap"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>\n`; },
      link(href, title, text) {
        const ext = /^https?:\/\//.test(href || '') && !(href || '').startsWith(SITE);
        return `<a href="${esc(href || '')}"${title ? ` title="${esc(title)}"` : ''}${ext ? ' rel="noopener"' : ''}>${text}</a>`;
      },
    } });
    const html = md.parse(m[2].replace(/^\s*#\s.*\n/, ''));
    const words = m[2].split(/\s+/).filter(Boolean).length;
    const date = isoDay(fm.date), updated = fm.updated ? isoDay(fm.updated) : date;
    posts.push({ slug, path: `/blog/${slug}/`, title: String(fm.title), description: String(fm.description), date, updated,
      author: String(fm.author || 'Kelbari'), category: String(fm.category || 'Guides'), service: fm.service ? String(fm.service) : '',
      keywords: [].concat(fm.keywords || []).map(String), html, toc, words, minutes: Math.max(1, Math.round(words / 220)) });
  }
  posts.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}
const postCard = (p, h = 'h2') => `<li><article class="post-card"><span class="post-cat">${esc(p.category)}</span><${h}><a href="${p.path}">${esc(p.title)}</a></${h}><p>${esc(p.description)}</p><p class="post-meta"><span><time datetime="${p.date}">${longDate(p.date)}</time></span><span>${p.minutes} min read</span></p></article></li>`;
log('blog:', posts.length, 'articles');


for (const s of content.services) {
  const path = `/${s.slug}/`;
  const related = s.category ? projects.filter((p) => p.category === s.category) : [];
  const parent = s.parent ? content.services.find((o) => o.slug === s.parent) : null;
  const children = content.services.filter((o) => o.parent === s.slug);
  const others = [...children, ...(parent ? [parent] : []), ...content.services.filter((o) => !o.parent && o.slug !== s.slug && o !== parent)];
  const trail = [['Home', '/'], ['Services', '/#services'], ...(parent ? [[parent.name, `/${parent.slug}/`]] : []), [s.name, path]];
  const guides = posts.filter((p) => p.service === s.slug || children.some((c) => c.slug === p.service));
  const body = `
<section class="page-hero"><div class="wrap">
${crumbs(trail)}
<p class="eyebrow">${parent ? `<a href="/${parent.slug}/">${esc(parent.name)}</a>` : esc(s.name)}</p>
<h1 class="display page-title">${esc(s.h1)}</h1>
<p class="page-lede">${esc(s.lede)}</p>
<div class="cta"><a class="btn btn-cobalt btn-lg" href="/#contact">Start a project</a>${related.length ? '<a class="btn btn-ghost btn-lg" href="#work-list">See the work</a>' : guides.length ? '<a class="btn btn-ghost btn-lg" href="#guides">Read the guides</a>' : ''}</div>
</div></section>
<section class="svc-section" aria-labelledby="what-title"><div class="wrap">
<div class="sec-head" data-reveal><h2 id="what-title">What we do</h2></div>
<ul class="svc-list">${s.items.map((it, i) => `<li data-reveal><span class="svc-num">${String(i + 1).padStart(2, '0')}</span><h3>${esc(it.name)}</h3><p>${esc(it.text)}</p></li>`).join('')}</ul>
</div></section>
<section class="svc-section" aria-labelledby="how-title"><div class="wrap">
<div class="sec-head" data-reveal><h2 id="how-title">How a project runs</h2></div>
<ol class="svc-steps">${content.process.map((st) => `<li data-reveal><h3>${esc(st.name)}</h3><p>${esc(st.text)}</p></li>`).join('')}</ol>
</div></section>
${related.length ? `<section class="svc-section" id="work-list" aria-labelledby="rel-title"><div class="wrap">
<div class="sec-head" data-reveal><h2 id="rel-title">${esc(s.name)} work</h2></div>
<div class="projects">${related.map(card).join('')}</div>
</div></section>` : ''}
${guides.length ? `<section class="svc-section" id="guides" aria-labelledby="guides-title"><div class="wrap">
<div class="sec-head" data-reveal><h2 id="guides-title">Guides</h2></div>
<ul class="post-grid">${guides.slice(0, 6).map((p) => postCard(p, 'h3')).join('')}</ul>
</div></section>` : ''}
<section class="svc-section" aria-labelledby="faq-title"><div class="wrap faq-wrap">
<div class="sec-head" data-reveal><h2 id="faq-title">Questions</h2></div>
<div class="faq">${s.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>
</div></section>
<section class="svc-section svc-more" aria-labelledby="more-title"><div class="wrap">
<h2 id="more-title" class="more-title">Also from the same team</h2>
<div class="more-links">${others.map((o) => `<a class="more-link" href="/${o.slug}/"><span>${esc(o.name)}</span>${ARROW}</a>`).join('')}</div>
</div></section>
${ctaBand()}`;
  const jsonld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Service', '@id': `${SITE}${path}#service`, name: s.name, serviceType: s.name, ...(parent ? { isRelatedTo: { '@id': `${SITE}/${parent.slug}/#service` } } : {}), description: s.description, url: `${SITE}${path}`, provider: { '@type': 'Organization', ...ORG, name: 'Kelbari', url: `${SITE}/` }, areaServed: [{ '@type': 'City', name: 'Bahawalpur' }, { '@type': 'Country', name: 'Pakistan' }, 'Worldwide'],
      hasOfferCatalog: { '@type': 'OfferCatalog', name: s.name, itemListElement: s.items.map((it) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: it.name, description: it.text } })) } },
    { '@type': 'FAQPage', mainEntity: s.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    crumbLd(trail),
  ] };
  await mkdir(join(OUT, s.slug), { recursive: true });
  await writeFile(join(OUT, s.slug, 'index.html'), page({ path, title: s.title, description: s.description, jsonld, body }));
  sitemap.push({ loc: path, priority: '0.9' });
}

const galleryProjects = projects.filter(isGallery);
for (const [i, p] of galleryProjects.entries()) {
  const slug = slugOf(p), path = `/work/${slug}/`;
  const next = galleryProjects[(i + 1) % galleryProjects.length];
  const svc = content.services.find((s) => s.category === p.category);
  const trail = [['Home', '/'], ['Work', '/#work'], [p.title, path]];
  const desc = (p.description || `${p.title}, a project by Kelbari.`).slice(0, 158);
  const gal = galleryOf(p).map((g, k) => `<img src="${esc(g.image)}"${g.srcset ? ` srcset="${esc(g.srcset)}" sizes="${GALLERY_SIZES}"` : ''}${g.width ? ` width="${g.width}" height="${g.height}"` : ''} alt="${k === 0 ? esc(`${p.title} project showcase`) : ''}" ${k === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`).join('');
  const body = `
<article class="work-page">
<header class="page-hero work-hero"><div class="wrap">
${crumbs(trail)}
${p.category ? `<p class="eyebrow">${svc ? `<a href="/${svc.slug}/">${esc(p.category)}</a>` : esc(p.category)}</p>` : ''}
<h1 class="display page-title">${esc(p.title)}</h1>
${p.description ? `<p class="page-lede">${esc(p.description)}</p>` : ''}
${(p.highlights || []).filter(Boolean).length ? `<ul class="phigh work-high">${p.highlights.filter(Boolean).map((h) => `<li>${esc(typeof h === 'string' ? h : h.item)}</li>`).join('')}</ul>` : ''}
${(p.built_with || []).filter(Boolean).length ? `<div class="pstack work-stack"><span class="pstack-label">Built with</span>${p.built_with.filter(Boolean).map((t) => `<span class="ptag">${esc(typeof t === 'string' ? t : t.tool)}</span>`).join('')}</div>` : ''}
</div></header>
<div class="work-gallery">${gal}</div>
<nav class="work-nav wrap" aria-label="More work"><a class="btn btn-ghost" href="/#work">All work</a><a class="btn btn-ink" href="/work/${slugOf(next)}/"><span>Next: ${esc(next.title)}</span>${ARROW}</a></nav>
</article>
${ctaBand('Want work like this?')}`;
  const image = p.image_src || p.image;
  const jsonld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'CreativeWork', '@id': `${SITE}${path}#work`, name: p.title, headline: p.title, description: desc, url: `${SITE}${path}`, image: image ? `${SITE}${image}` : undefined, genre: p.category, creator: { '@type': 'Organization', ...ORG, name: 'Kelbari' }, ...(p.built_with ? { keywords: p.built_with.join(', ') } : {}) },
    crumbLd(trail),
  ] };
  await mkdir(join(OUT, 'work', slug), { recursive: true });
  await writeFile(join(OUT, 'work', slug, 'index.html'), page({ path, title: `${p.title} — ${p.category || 'Project'} by Kelbari`, description: desc, image: p.image ? p.image : undefined, jsonld, body }));
  sitemap.push({ loc: path, priority: '0.7', images: galleryOf(p).slice(0, 3).map((g) => ({ loc: g.image, title: p.title })) });
}
log('pages:', content.services.length, 'services,', galleryProjects.length, 'projects,', posts.length, 'articles');

/* ---------- 4a. /blog/ and one page per article, plus an RSS feed ---------- */
if (posts.length) {
  const blogPath = '/blog/';
  const blogTitle = 'Kelbari Blog — Websites, SaaS, Marketing, SEO & AI Guides';
  const blogDesc = 'Practical guides from Kelbari on website costs, online stores, SaaS, social media, SEO and AI chatbots, written for business owners in Pakistan and beyond.';
  const orgPublisher = { '@type': 'Organization', ...ORG, name: 'Kelbari', url: `${SITE}/`, logo: { '@type': 'ImageObject', url: `${SITE}/assets/brand/icon-512.png` } };
  const authorLd = (a) => (FOUNDERS.includes(a) ? { '@type': 'Person', name: a, url: `${SITE}/about/` } : { '@type': 'Organization', ...ORG, name: 'Kelbari', url: `${SITE}/` });
  {
    const trail = [['Home', '/'], ['Blog', blogPath]];
    const body = `
<section class="page-hero"><div class="wrap">
${crumbs(trail)}
<p class="eyebrow">Blog</p>
<h1 class="display page-title">Plain answers for building a business online.</h1>
<p class="page-lede">Guides on websites, online stores, SaaS, social media, SEO and AI, written from the work we do every day for businesses in Pakistan and abroad.</p>
</div></section>
<section class="svc-section" aria-label="Articles"><div class="wrap">
<ul class="post-grid">${posts.map((p) => postCard(p)).join('')}</ul>
</div></section>
${ctaBand()}`;
    const jsonld = { '@context': 'https://schema.org', '@graph': [
      { '@type': 'Blog', '@id': `${SITE}${blogPath}#blog`, name: 'Kelbari Blog', description: blogDesc, url: `${SITE}${blogPath}`, inLanguage: 'en', publisher: orgPublisher,
        blogPost: posts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: `${SITE}${p.path}`, datePublished: p.date, dateModified: p.updated })) },
      crumbLd(trail),
    ] };
    await mkdir(join(OUT, 'blog'), { recursive: true });
    await writeFile(join(OUT, 'blog', 'index.html'), page({ path: blogPath, title: blogTitle, description: blogDesc, jsonld, body }));
    sitemap.push({ loc: blogPath, priority: '0.8', lastmod: posts[0].updated });
  }
  for (const p of posts) {
    const trail = [['Home', '/'], ['Blog', blogPath], [p.title, p.path]];
    const svc = content.services.find((s) => s.slug === p.service);
    const related = [...posts.filter((o) => o !== p && o.category === p.category), ...posts.filter((o) => o !== p && o.category !== p.category)].slice(0, 3);
    const body = `
<article class="post">
<header class="page-hero post-hero"><div class="wrap">
${crumbs(trail)}
<p class="eyebrow"><a href="/blog/">${esc(p.category)}</a></p>
<h1 class="display page-title">${esc(p.title)}</h1>
<p class="page-lede">${esc(p.description)}</p>
<p class="post-meta"><span>By ${esc(p.author)}</span><span><time datetime="${p.date}">${longDate(p.date)}</time></span>${p.updated !== p.date ? `<span>Updated <time datetime="${p.updated}">${longDate(p.updated)}</time></span>` : ''}<span>${p.minutes} min read</span></p>
</div></header>
<div class="wrap post-layout">
<div class="article">${p.html}</div>
<aside class="post-aside">
${p.toc.length >= 3 ? `<nav class="aside-card toc" aria-labelledby="toc-title"><h2 id="toc-title">In this article</h2><ol>${p.toc.map((t) => `<li><a href="#${t.id}">${t.text.replace(/<[^>]+>/g, '')}</a></li>`).join('')}</ol></nav>` : ''}
<div class="aside-card aside-cta"><h2>Work with Kelbari</h2><p>Send a short brief and get a written proposal, usually within 48 hours.</p><a class="btn btn-electric" href="/#contact">Start a project</a>${svc ? `<a class="aside-link" href="/${svc.slug}/">More about ${esc(svc.name)}</a>` : ''}</div>
</aside>
</div>
</article>
${related.length ? `<section class="svc-section" aria-labelledby="more-posts"><div class="wrap">
<div class="sec-head" data-reveal><h2 id="more-posts">Keep reading</h2></div>
<ul class="post-grid">${related.map((o) => postCard(o, 'h3')).join('')}</ul>
</div></section>` : ''}
${ctaBand()}`;
    const jsonld = { '@context': 'https://schema.org', '@graph': [
      { '@type': 'BlogPosting', '@id': `${SITE}${p.path}#article`, headline: p.title, description: p.description, url: `${SITE}${p.path}`, mainEntityOfPage: `${SITE}${p.path}`,
        datePublished: `${p.date}T09:00:00+05:00`, dateModified: `${p.updated}T09:00:00+05:00`, author: authorLd(p.author), publisher: orgPublisher,
        image: `${SITE}/assets/og-image.png`, inLanguage: 'en', articleSection: p.category, wordCount: p.words, ...(p.keywords.length ? { keywords: p.keywords.join(', ') } : {}),
        isPartOf: { '@id': `${SITE}${blogPath}#blog` } },
      crumbLd(trail),
    ] };
    await mkdir(join(OUT, 'blog', p.slug), { recursive: true });
    await writeFile(join(OUT, 'blog', p.slug, 'index.html'), page({ path: p.path, title: `${p.title} | Kelbari`, description: p.description, jsonld, body, type: 'article' }));
    sitemap.push({ loc: p.path, priority: '0.7', lastmod: p.updated });
  }
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Kelbari Blog</title>
<link>${SITE}${blogPath}</link>
<atom:link href="${SITE}/blog/feed.xml" rel="self" type="application/rss+xml"/>
<description>${esc(blogDesc)}</description>
<language>en</language>
<lastBuildDate>${new Date(`${posts[0].updated}T04:00:00Z`).toUTCString()}</lastBuildDate>
${posts.map((p) => `<item><title>${esc(p.title)}</title><link>${SITE}${p.path}</link><guid isPermaLink="true">${SITE}${p.path}</guid><pubDate>${new Date(`${p.date}T04:00:00Z`).toUTCString()}</pubDate><category>${esc(p.category)}</category><description>${esc(p.description)}</description></item>`).join('\n')}
</channel>
</rss>
`;
  await writeFile(join(OUT, 'blog', 'feed.xml'), rss);
}

/* ---------- 4b. /about/ — the facts about Kelbari in one place (for people, search engines and AI answers) ---------- */
{
  const path = '/about/';
  const trail = [['Home', '/'], ['About Kelbari', path]];
  const facts = [
    ['Name', 'Kelbari'],
    ['What it is', 'A web development, digital marketing and graphic design agency'],
    ['Based in', 'Bahawalpur, Punjab, Pakistan'],
    ['Works with', 'Clients across Pakistan and abroad, including the United States'],
    ['Founders', 'Saqlain Akbar and Hafiz Ahmad'],
    ['Website', 'kelbari.net'],
    ['WhatsApp', '+92 301 9233246 (24/7)'],
    ['Email', 'kelbariofficial@gmail.com'],
    ['Support', 'support@kelbari.net · support.kelbari@gmail.com'],
    ['LinkedIn', 'linkedin.com/company/kelbari'],
  ];
  const body = `
<section class="page-hero"><div class="wrap">
${crumbs(trail)}
<p class="eyebrow">About Kelbari</p>
<h1 class="display page-title">One team for the whole digital side of a business.</h1>
<p class="page-lede">Kelbari is a web development, digital marketing and graphic design agency based in Bahawalpur, Pakistan, founded by Saqlain Akbar and Hafiz Ahmad. We build the website, run the social media and design the brand, so all three hold together.</p>
<div class="cta"><a class="btn btn-cobalt btn-lg" href="/#contact">Start a project</a><a class="btn btn-ghost btn-lg" href="/#work">See the work</a></div>
</div></section>
<section class="svc-section" aria-labelledby="facts-title"><div class="wrap">
<div class="sec-head" data-reveal><h2 id="facts-title">Kelbari at a glance</h2></div>
<dl class="facts">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
</div></section>
<section class="svc-section" aria-labelledby="why-title"><div class="wrap">
<div class="sec-head" data-reveal><h2 id="why-title">Why one team</h2></div>
<div class="prose" data-reveal>
<p>Businesses don’t have a website problem, a social media problem and a design problem. They have one brand that has to hold together across all three. When those jobs go to three different people, nothing matches and nobody owns the result.</p>
<p>So Kelbari works as a single connected unit. Every engagement starts with a written brief, runs on a visible timeline, and ends with the client owning every file, repository and account. No jargon, no retainer you can’t cancel, and no work you can’t take with you.</p>
</div>
</div></section>
<section class="svc-section" aria-labelledby="svc-title"><div class="wrap">
<div class="sec-head" data-reveal><h2 id="svc-title">Services</h2></div>
<ul class="svc-list">${content.services.map((sv, i) => `<li data-reveal><span class="svc-num">${String(i + 1).padStart(2, '0')}</span><h3><a href="/${sv.slug}/">${esc(sv.name)}</a></h3><p>${esc(sv.lede)}</p></li>`).join('')}</ul>
</div></section>
<section class="svc-section" aria-labelledby="aw-title"><div class="wrap">
<div class="sec-head" data-reveal><h2 id="aw-title">Selected work</h2></div>
<ul class="work-index">${projects.map((pr) => `<li><a href="${isGallery(pr) ? `/work/${slugOf(pr)}/` : esc(pr.link || '/#work')}"${!isGallery(pr) && pr.link ? ' target="_blank" rel="noopener"' : ''}><strong>${esc(pr.title)}</strong><span>${esc(pr.category || '')}${pr.location ? ` · ${esc(pr.location)}` : ''}</span></a></li>`).join('')}</ul>
</div></section>
${ctaBand()}`;
  const jsonld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'AboutPage', '@id': `${SITE}${path}#page`, url: `${SITE}${path}`, name: 'About Kelbari', about: ORG, mainEntity: ORG, inLanguage: 'en' },
    crumbLd(trail),
  ] };
  await mkdir(join(OUT, 'about'), { recursive: true });
  await writeFile(join(OUT, 'about', 'index.html'), page({ path, title: 'About Kelbari — Web, Marketing & Design Agency, Bahawalpur', description: 'Kelbari is a web development, digital marketing and graphic design agency in Bahawalpur, Pakistan, founded by Saqlain Akbar and Hafiz Ahmad.', jsonld, body }));
  sitemap.splice(1, 0, { loc: path, priority: '0.9' });
}

/* ---------- 4c. /llms.txt — a plain-text summary for AI assistants (llmstxt.org) ---------- */
{
  const lines = [
    '# Kelbari',
    '',
    '> Kelbari (kelbari.net) is a web development, digital marketing and graphic design agency based in Bahawalpur, Punjab, Pakistan, founded by Saqlain Akbar and Hafiz Ahmad. One team builds a business\'s website, runs its social media and designs its brand. Kelbari works with clients across Pakistan and abroad.',
    '',
    'Kelbari is an agency name. It is not related to the fish species Cichla kelberi.',
    '',
    '- Website: https://kelbari.net/',
    '- WhatsApp: +92 301 9233246 (support 24/7)',
    '- Email: kelbariofficial@gmail.com (support: support@kelbari.net or support.kelbari@gmail.com)',
    '- Location: Bahawalpur, Punjab, Pakistan',
    '- Founders: Saqlain Akbar, Hafiz Ahmad',
    '- LinkedIn: https://www.linkedin.com/company/kelbari/',
    '',
    '## Pages',
    '',
    `- [About Kelbari](${SITE}/about/): who Kelbari is, where it is based, founders and contact details`,
    ...content.services.map((sv) => `- [${sv.name}](${SITE}/${sv.slug}/): ${sv.lede}`),
    `- [Home](${SITE}/): services, process, selected work and contact form`,
    '',
    ...(posts.length ? ['## Blog', '', `- [All articles](${SITE}/blog/): guides for business owners`, ...posts.map((p) => `- [${p.title}](${SITE}${p.path}): ${p.description}`), ''] : []),
    '## Selected work',
    '',
    ...projects.map((pr) => `- [${pr.title}](${isGallery(pr) ? `${SITE}/work/${slugOf(pr)}/` : pr.link || `${SITE}/#work`}): ${pr.category || 'Project'}${pr.location ? `, ${pr.location}` : ''}. ${(pr.description || '').split('. ')[0].replace(/\.$/, '')}.`),
    '',
    '## How a project runs',
    '',
    ...content.process.map((st) => `- ${st.name}: ${st.text}`),
    '',
  ];
  await writeFile(join(OUT, 'llms.txt'), lines.join('\n'));
}

/* ---------- 5. sitemap ---------- */
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${sitemap.map((u) => `  <url>
    <loc>${SITE}${u.loc}</loc>
    <lastmod>${u.lastmod || TODAY}</lastmod>
    <priority>${u.priority}</priority>${(u.images || []).map((im) => `
    <image:image><image:loc>${SITE}${esc(im.loc)}</image:loc><image:title>${esc(im.title)}</image:title></image:image>`).join('')}
  </url>`).join('\n')}
</urlset>
`;
await writeFile(join(OUT, 'sitemap.xml'), xml);

/* ---------- 6. assets: one fingerprinted script, inlined CSS, minified HTML ---------- */
const jsFiles = ['hero.js', 'main.js', 'cursor.js', 'effects.js'];
let bundle = '';
for (const f of jsFiles) {
  const { code } = await esbuild.transform(await readFile(join(SRC, 'assets/js', f), 'utf8'), { minify: true, target: 'es2020' });
  bundle += code.trim().replace(/;?$/, ';') + '\n';
}
const jsHash = createHash('sha256').update(bundle).digest('hex').slice(0, 10);
const jsName = `/assets/js/app.${jsHash}.js`;
await writeFile(join(OUT, jsName), bundle);

const { code: css } = await esbuild.transform(await readFile(join(SRC, 'assets/css/styles.css'), 'utf8'), { loader: 'css', minify: true, target: ['chrome100', 'safari15', 'firefox100'] });
const cssHash = createHash('sha256').update(css).digest('hex').slice(0, 10);
await writeFile(join(OUT, `assets/css/styles.${cssHash}.css`), css);
log('js', bundle.length, 'bytes; css', css.length, 'bytes');

async function finalize(file, html) {
  // one script instead of four (pages without the hero simply skip that part)
  const tags = /<script src="\/assets\/js\/(hero|main|cursor|effects)\.js" defer><\/script>\n?/g;
  if (tags.test(html)) {
    let first = true;
    html = html.replace(tags, () => (first ? ((first = false), `<script src="${jsName}" defer></script>\n`) : ''));
  }
  // inline the stylesheet: no render-blocking request
  html = html.replace(/<link rel="stylesheet" href="\/assets\/css\/styles\.css">/, `<style>${css}</style>`);
  // compact JSON-LD
  html = html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g, (m, a, j, b) => { try { return a + JSON.stringify(JSON.parse(j)) + b; } catch { return m; } });
  html = await minifyHtml(html, { collapseWhitespace: true, conservativeCollapse: false, removeComments: true, removeRedundantAttributes: true, useShortDoctype: true, minifyJS: false, minifyCSS: false, keepClosingSlash: false, sortAttributes: false });
  await writeFile(file, html);
}
await finalize(join(OUT, 'index.html'), index);
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'admin') await walk(p); }
    else if (e.name.endsWith('.html') && p !== join(OUT, 'index.html')) await finalize(p, await readFile(p, 'utf8'));
  }
}
await walk(OUT);
log('done →', OUT);
