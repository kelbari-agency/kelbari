#!/usr/bin/env python3
"""Regenerate Kelbari's icon set and Open Graph image from the brand geometry.

Run from the repo root:   python3 tools/make-brand-assets.py
Needs: Pillow and Playwright with Chromium (pip install pillow playwright).

Sizes follow the Kelbari Brand Guidelines, section 05:
  favicon 32 / 16 px  - symbol 56%, Kelbari Deep, 16 px uses the small-size variant
  iOS app icon        - symbol 52%, Kelbari Deep, square art, no text
  Android / manifest  - symbol 48%, Kelbari Deep, symbol inside the 66% safe circle
The symbol is never redrawn: the full mark uses the exact 64-unit geometry from the site.
"""
import io
import pathlib

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
BRAND = ROOT / "public" / "assets" / "brand"
BRAND.mkdir(parents=True, exist_ok=True)

DEEP, AQUA, WHITE = "#07322F", "#34D3B4", "#FFFFFF"

FULL = (
    f'<g stroke="{WHITE}" stroke-width="4" stroke-linecap="round">'
    '<path d="M14 12V52"/><path d="M14 32L48 12"/><path d="M14 32L48 52"/></g>'
    f'<circle cx="14" cy="12" r="6" fill="{WHITE}"/><circle cx="14" cy="52" r="6" fill="{WHITE}"/>'
    f'<circle cx="48" cy="12" r="6" fill="{AQUA}"/><circle cx="48" cy="52" r="6" fill="{AQUA}"/>'
    f'<circle cx="14" cy="32" r="5" fill="{DEEP}" stroke="{WHITE}" stroke-width="3"/>'
)
# Small-size variant (16-23 px): hub and stem nodes dropped, stroke 6.
SMALL = (
    f'<g stroke="{WHITE}" stroke-width="6" stroke-linecap="round">'
    '<path d="M14 12V52"/><path d="M14 32L48 12"/><path d="M14 32L48 52"/></g>'
    f'<circle cx="48" cy="12" r="6" fill="{AQUA}"/><circle cx="48" cy="52" r="6" fill="{AQUA}"/>'
)


def icon_svg(size, pct, symbol):
    scale = (size * pct) / 64
    offset = (size - 64 * scale) / 2
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">'
        f'<rect width="{size}" height="{size}" fill="{DEEP}"/>'
        f'<g transform="translate({offset} {offset}) scale({scale})">{symbol}</g></svg>'
    )


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ss = 4  # supersample, then downscale for clean small sizes

        def render_icon(size, pct, symbol):
            page = browser.new_page(viewport={"width": size, "height": size}, device_scale_factor=ss)
            page.set_content(f'<body style="margin:0">{icon_svg(size, pct, symbol)}</body>')
            png = page.screenshot(clip={"x": 0, "y": 0, "width": size, "height": size})
            page.close()
            return Image.open(io.BytesIO(png)).convert("RGB").resize((size, size), Image.LANCZOS)

        icons = {
            "favicon-16.png": render_icon(16, 0.56, SMALL),
            "favicon-32.png": render_icon(32, 0.56, FULL),
            "apple-touch-icon.png": render_icon(180, 0.52, FULL),
            "icon-192.png": render_icon(192, 0.48, FULL),
            "icon-512.png": render_icon(512, 0.48, FULL),
        }
        for name, img in icons.items():
            img.save(BRAND / name, optimize=True)

        # favicon.ico at the site root holds both sizes
        icons["favicon-32.png"].save(
            ROOT / "public" / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32)],
            append_images=[icons["favicon-16.png"]],
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
        '<g stroke="#07322F" stroke-width="4" stroke-linecap="round"><path d="M14 12V52"/><path d="M14 32L48 12"/><path d="M14 32L48 52"/></g>'
        '<circle cx="14" cy="12" r="6" fill="#07322F"/><circle cx="14" cy="52" r="6" fill="#07322F"/>'
        '<circle cx="48" cy="12" r="6" fill="#34D3B4"/><circle cx="48" cy="52" r="6" fill="#34D3B4"/>'
        '<circle cx="14" cy="32" r="5" fill="#F2F6F5" stroke="#07322F" stroke-width="3"/>'
    )
    (BRAND / "kelbari-symbol.svg").write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">{dark}</svg>\n'
    )
    print("Brand assets written to", BRAND, "and public/assets/og-image.png")


if __name__ == "__main__":
    main()
