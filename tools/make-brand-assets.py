#!/usr/bin/env python3
"""Regenerate Kelbari's icon set and Open Graph image from the brand geometry.

Run from the repo root:   python3 tools/make-brand-assets.py
Needs: Pillow and Playwright with Chromium (pip install pillow playwright).

Sizes follow the original Kelbari brand guide (section 05); colours follow the v2 palette:
  favicon 32 / 16 px  - symbol 56%, Midnight, 16 px uses the small-size variant
  favicon 16-144 + svg - light colourway (the profile logo), symbol about 67%: Google Search shows the site icon only when it is a
                        square multiple of 48 px, so these sizes (and favicon.svg) are what it picks up
  iOS app icon        - symbol 52%, Midnight, square art, no text
  Android / manifest  - symbol 48%, Midnight, symbol inside the 66% safe circle
The symbol is never redrawn: the full mark uses the exact 64-unit geometry from the site.
"""
import io
import pathlib

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
BRAND = ROOT / "public" / "assets" / "brand"
BRAND.mkdir(parents=True, exist_ok=True)

DEEP, AQUA, WHITE = "#12133B", "#8B88FF", "#FFFFFF"  # Midnight, Electric, White

FULL = (
    f'<g stroke="{WHITE}" stroke-width="4" stroke-linecap="round">'
    '<path d="M14 12V52"/><path d="M14 32L48 12"/><path d="M14 32L48 52"/></g>'
    f'<circle cx="14" cy="12" r="6" fill="{WHITE}"/><circle cx="14" cy="52" r="6" fill="{WHITE}"/>'
    f'<circle cx="48" cy="12" r="6" fill="{AQUA}"/><circle cx="48" cy="52" r="6" fill="{AQUA}"/>'
    f'<circle cx="14" cy="32" r="5" fill="{DEEP}" stroke="{WHITE}" stroke-width="3"/>'
)
# Light colourway (the profile-picture logo): Midnight strokes and stem nodes, Cobalt outer nodes,
# Paper hub, on Paper. Used for every favicon, so the icon in browser tabs and Google results
# matches the logo on WhatsApp and LinkedIn.
PAPER, INK, COBALT = "#F8F8FC", "#12133B", "#3B36F4"
FULL_LIGHT = (
    f'<g stroke="{INK}" stroke-width="4" stroke-linecap="round">'
    '<path d="M14 12V52"/><path d="M14 32L48 12"/><path d="M14 32L48 52"/></g>'
    f'<circle cx="14" cy="12" r="6" fill="{INK}"/><circle cx="14" cy="52" r="6" fill="{INK}"/>'
    f'<circle cx="48" cy="12" r="6" fill="{COBALT}"/><circle cx="48" cy="52" r="6" fill="{COBALT}"/>'
    f'<circle cx="14" cy="32" r="5" fill="{PAPER}" stroke="{INK}" stroke-width="3"/>'
)
SMALL_LIGHT = (
    f'<g stroke="{INK}" stroke-width="6" stroke-linecap="round">'
    '<path d="M14 12V52"/><path d="M14 32L48 12"/><path d="M14 32L48 52"/></g>'
    f'<circle cx="48" cy="12" r="6" fill="{COBALT}"/><circle cx="48" cy="52" r="6" fill="{COBALT}"/>'
)
# Small-size variant (16-23 px): hub and stem nodes dropped, stroke 6.
SMALL = (
    f'<g stroke="{WHITE}" stroke-width="6" stroke-linecap="round">'
    '<path d="M14 12V52"/><path d="M14 32L48 12"/><path d="M14 32L48 52"/></g>'
    f'<circle cx="48" cy="12" r="6" fill="{AQUA}"/><circle cx="48" cy="52" r="6" fill="{AQUA}"/>'
)


def icon_svg(size, pct, symbol, bg=DEEP):
    scale = (size * pct) / 64
    offset = (size - 64 * scale) / 2
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">'
        f'<rect width="{size}" height="{size}" fill="{bg}"/>'
        f'<g transform="translate({offset} {offset}) scale({scale})">{symbol}</g></svg>'
    )


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ss = 4  # supersample, then downscale for clean small sizes

        def render_icon(size, pct, symbol, bg=DEEP):
            page = browser.new_page(viewport={"width": size, "height": size}, device_scale_factor=ss)
            page.set_content(f'<body style="margin:0">{icon_svg(size, pct, symbol, bg)}</body>')
            png = page.screenshot(clip={"x": 0, "y": 0, "width": size, "height": size})
            page.close()
            return Image.open(io.BytesIO(png)).convert("RGB").resize((size, size), Image.LANCZOS)

        icons = {
            "favicon-16.png": render_icon(16, 0.74, SMALL_LIGHT, PAPER),
            "favicon-32.png": render_icon(32, 0.70, FULL_LIGHT, PAPER),
            "favicon-48.png": render_icon(48, 0.67, FULL_LIGHT, PAPER),
            "favicon-96.png": render_icon(96, 0.67, FULL_LIGHT, PAPER),
            "favicon-144.png": render_icon(144, 0.67, FULL_LIGHT, PAPER),
            "apple-touch-icon.png": render_icon(180, 0.52, FULL),
            "icon-192.png": render_icon(192, 0.48, FULL),
            "icon-512.png": render_icon(512, 0.48, FULL),
        }
        for name, img in icons.items():
            img.save(BRAND / name, optimize=True)

        # favicon.ico at the site root holds 16, 32 and 48 px (48 is the size Google Search needs)
        icons["favicon-48.png"].save(
            ROOT / "public" / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)],
            append_images=[icons["favicon-16.png"], icons["favicon-32.png"]],
        )
        # Scalable icon for browsers and Google (any multiple of 48 px)
        (ROOT / "public" / "favicon.svg").write_text(
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="{PAPER}"/>'
            f'<g transform="translate(10.56 10.56) scale(0.67)">{FULL_LIGHT}</g></svg>\n'
        )

        # Open Graph image, 1200 x 630
        page = browser.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=2)
        page.goto((ROOT / "tools" / "og-template.html").as_uri())
        page.evaluate("document.fonts.ready")
        page.wait_for_timeout(400)
        png = page.screenshot(clip={"x": 0, "y": 0, "width": 1200, "height": 630})
        page.close()
        og = Image.open(io.BytesIO(png)).convert("RGB").resize((1200, 630), Image.LANCZOS)
        og.save(ROOT / "public" / "assets" / "og-image.png", optimize=True)
        browser.close()

    # Plain SVG copies of the mark (exact geometry) for designers and docs.
    (BRAND / "kelbari-symbol-on-deep.svg").write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">{FULL}</svg>\n'
    )
    dark = (
        '<g stroke="#12133B" stroke-width="4" stroke-linecap="round"><path d="M14 12V52"/><path d="M14 32L48 12"/><path d="M14 32L48 52"/></g>'
        '<circle cx="14" cy="12" r="6" fill="#12133B"/><circle cx="14" cy="52" r="6" fill="#12133B"/>'
        '<circle cx="48" cy="12" r="6" fill="#3B36F4"/><circle cx="48" cy="52" r="6" fill="#3B36F4"/>'
        '<circle cx="14" cy="32" r="5" fill="#F8F8FC" stroke="#12133B" stroke-width="3"/>'
    )
    (BRAND / "kelbari-symbol.svg").write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">{dark}</svg>\n'
    )
    print("Brand assets written to", BRAND, "and public/assets/og-image.png")


if __name__ == "__main__":
    main()
