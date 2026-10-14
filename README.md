# Kelbari website

The marketing site for [Kelbari](https://kelbari.net): web development, digital marketing (including social media marketing) and graphic design, sold as one connected system.

Plain HTML, CSS and JavaScript. No build step, no framework. Self-hosted fonts (Bricolage Grotesque, Geist and Geist Mono).

## Structure

```
.
├── netlify.toml              Netlify settings: publish folder, security headers, font caching
├── README.md
├── tools/
│   ├── make-brand-assets.py  Regenerates the favicon set, app icons and the social preview image
│   └── og-template.html      Template for the social preview image (1200 × 630)
└── public/                   Everything in here is published. Nothing outside it is.
    ├── index.html            The single-page site
    ├── 404.html              Not-found page
    ├── admin/                Decap CMS: index.html (loader) and config.yml (fields)
    ├── data/projects.json    The portfolio. Edited through /admin, or by hand
    ├── images/uploads/       Project cover images uploaded through /admin
    ├── assets/
    │   ├── css/styles.css    All styles, built on the brand tokens
    │   ├── js/hero.js        Hero tile: the K mark grows into a live network
    │   ├── js/main.js        Menu, header, services spine, stacking process cards, portfolio, contact form
    │   ├── js/cursor.js      Custom Node K cursor (mouse/trackpad only)
    │   ├── js/effects.js     Motion layer: headline and card reveals, card tilt, scroll progress, spotlights
    │   ├── fonts/            Bricolage Grotesque, Geist, Geist Mono (variable woff2) and licences
    │   ├── brand/            Favicons, app icons, plain SVG copies of the Node K mark
    │   └── og-image.png      Social preview image
    ├── favicon.ico  robots.txt  sitemap.xml  site.webmanifest
```

## Preview locally

```bash
python3 -m http.server 8000 -d public
# open http://localhost:8000
```

Everything works locally, including the contact form: both buttons open the visitor's own app (WhatsApp or their mail app) with the brief pre-filled, and nothing is sent until they press send there.

## Add or remove portfolio projects

Until a project exists, the Selected work section shows "Case studies coming soon".

**Through the CMS (for the founders)**

1. Go to `https://kelbari.net/admin` and sign in with GitHub.
2. Open **Selected work → Projects**.
3. Add a project (title, category, description, cover image, optional link) or delete one with the trash icon.
4. Click **Publish**. The change is committed to `main` and the site redeploys in about a minute.

Each person who uses the CMS needs a GitHub account with write access to this repository.

**By hand**

Edit `public/data/projects.json`. An empty portfolio is `{ "projects": [] }`. Each project looks like this:

```json
{
  "projects": [
    {
      "title": "Project name",
      "category": "Web development",
      "description": "What was built, and what changed for the client.",
      "image": "/images/uploads/project-name.jpg",
      "link": "https://example.com"
    }
  ]
}
```

`category` is one of: Web development, Digital marketing, Graphic design, Full brand system. `image` and `link` are optional.

Every card is clickable and has one button:

- **View site**: the project has a `link`. Opens the live site in a new tab.
- **View project**: the project has a `slug` and a `gallery` (a list of full-width images, each with `image`, `width` and `height`). Opens a viewer on this page at `kelbari.net/#work/<slug>`, so the work is shown here without sending visitors elsewhere. Gallery images live in `public/images/work/<slug>/`.

The filter buttons above the cards are built from the categories in use.

## How deploys work

- Every push or merge to `main` deploys to production at https://kelbari.net. Work on a branch and open a pull request to get a preview first.
- Every pull request gets its own deploy preview URL, posted on the pull request.
- `netlify.toml` publishes the `public/` folder with no build command.
- Netlify DNS manages `kelbari.net`. `www.kelbari.net` redirects to the apex domain. Do not add or remove DNS records for email or anything else without checking with the owners first.

## One-time setup in Netlify (owner only)

**CMS sign-in (GitHub OAuth).** Decap signs people in with GitHub through Netlify's OAuth provider:

1. On GitHub, go to **Settings → Developer settings → OAuth Apps → New OAuth App**. Use the Kelbari organization as the owner if you want it to live there.
2. Set **Homepage URL** to `https://kelbari.net` and **Authorization callback URL** to `https://api.netlify.com/auth/done`.
3. Register the app, copy the **Client ID**, and generate a **Client secret**.
4. In Netlify, open the site, then **Project configuration → Access & security → OAuth → Install provider → GitHub**. Paste the Client ID and Client secret.
5. Open `https://kelbari.net/admin` and sign in.

Never put the client secret in this repository.

## Design system (v2)

The site uses a v2 visual system. It replaces the colours and fonts in the original brand guide PDF; the Node K mark's shape and the copy are unchanged.

- **Type:** Bricolage Grotesque (variable, optical size) for display and headings; Geist for body, labels and buttons; Geist Mono only for step numbers and small technical details. All self-hosted in `public/assets/fonts/` with their licences.
- **Colours:** Midnight `#12133B` (dark surfaces, main text), Cobalt `#3B36F4` (primary actions on light surfaces), Electric `#8B88FF` (accent on dark surfaces), Signal `#FF5A7A` (rare highlight), Haze `#ECECFE`, Paper `#F8F8FC`, White, Slate `#555878` (secondary text), Line `#DADBEE`.
- **Contrast rules:** never Cobalt on Midnight (use Electric there); never Signal as text on light surfaces; text on Signal is always Midnight. Every text pairing on the site meets WCAG AA.
- **Logo colours:** on light, strokes and stem nodes Midnight, outer nodes Cobalt, hub filled Paper. On dark, strokes and stem nodes White, outer nodes Electric, hub filled Midnight. The mark's geometry is never redrawn, stretched or rotated. Both versions are inline `<symbol>`s at the top of `index.html` and SVG files in `public/assets/brand/`.
- **Shapes:** large surfaces 32px radius, cards 24px, inputs 14px, buttons and chips fully rounded.
- **Layouts:** a floating pill header, a bento hero (live network tile and stat tiles), a running band, an index-style services list on a scroll-linked spine, stacking process cards, a skeleton "coming soon" state, and a wordmark footer.

The favicon set keeps the original guide's sizing (32 px and 16 px at 56% symbol, with the 16 px using the small-size variant), now on Midnight. To regenerate the icons and the social preview image:

```bash
pip install pillow playwright && playwright install chromium
python3 tools/make-brand-assets.py
```

## Accessibility and performance

- Semantic landmarks, a skip link, visible keyboard focus and labelled form fields with inline errors.
- `prefers-reduced-motion`: the whole effects layer (`effects.js`) is skipped, the hero network renders as a single still frame, the running band stops, scroll-linked pieces show in their final state and the custom cursor is off.
- No third-party scripts or fonts on the public site. The only external script is Decap CMS on `/admin`, pinned to an exact version with an integrity hash.

## Placeholders to avoid

The brand guide's example contact details (`kelbari.com`, `hello@kelbari.com`) and sample name are placeholders. The real contact details are in `public/index.html`.
