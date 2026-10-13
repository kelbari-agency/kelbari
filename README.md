# Kelbari website

The marketing site for [Kelbari](https://kelbari.net): web development, social media marketing and graphic design, sold as one connected system.

Plain HTML, CSS and JavaScript. No build step, no framework. Self-hosted fonts (Manrope and JetBrains Mono).

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
    │   ├── js/hero.js        Hero: the K mark grows into a live network
    │   ├── js/main.js        Menu, services tree, process line, portfolio, contact form
    │   ├── fonts/            Manrope (variable) and JetBrains Mono, woff2
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

`category` is one of: Web development, Social media marketing, Graphic design, Full brand system. `image` and `link` are optional.

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

## Brand rules the code follows

From the Kelbari Brand Guidelines v1.0:

- Colours: Deep `#07322F`, Signal Teal `#0F9B85`, Aqua `#34D3B4`, Mint `#E3F7F2`, Ink `#0C1412`, Graphite `#4C5754`, Mist `#A9B4B1`, Paper `#F2F6F5`, White. Roughly Deep 60%, Paper 30%, Aqua 7%, Teal 3%.
- Aqua is an accent: never text on white or on teal. Teal on white is for text 24px and up only (this site uses teal for graphics and focus rings, not small text).
- Manrope 800 for display and headings, 600 for labels and buttons, 400 for body. JetBrains Mono for small technical details.
- The Node K mark is always the supplied vector, never redrawn, stretched, rotated, recoloured or given a shadow. Nothing enters its clear space (12 grid units).
- The error colour appears only in form states.

The favicon set follows the guide (32 px and 16 px at 56% symbol on Deep, with the 16 px using the small-size variant). To regenerate it and the social preview image:

```bash
pip install pillow playwright && playwright install chromium
python3 tools/make-brand-assets.py
```

## Accessibility and performance

- Semantic landmarks, a skip link, visible keyboard focus and labelled form fields with inline errors.
- `prefers-reduced-motion`: the hero network renders as a single still frame and scroll-linked lines show fully drawn.
- No third-party scripts or fonts on the public site. The only external script is Decap CMS on `/admin`, pinned to an exact version with an integrity hash.

## Placeholders to avoid

The brand guide's example contact details (`kelbari.com`, `hello@kelbari.com`) and sample name are placeholders. The real contact details are in `public/index.html`.
