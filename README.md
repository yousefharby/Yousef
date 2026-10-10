# Yousef Harby — Portfolio

A cinematic, bilingual (EN / AR-RTL) portfolio. Static HTML/CSS/JS, so it deploys to GitHub Pages as-is: no build step and no backend.

- **Motion:** GSAP 3.15 (ScrollTrigger + SplitText) and Lenis 1.3.26, bundled locally in `vendor/`
- **Fonts:** self-hosted in `public/fonts/` (Anton, Manrope, Ms Madi, Alexandria, Aref Ruqaa; all SIL OFL)
- **Images:** WebP with JPG/PNG fallbacks, responsive `srcset`, lazy-loaded below the fold
- **Lighthouse** (mobile, throttled, gzip like GitHub Pages): Performance ≈ 90, Accessibility 100, Best Practices 100, SEO 100
- Respects `prefers-reduced-motion`, works without JavaScript, has no console errors, and opens straight from disk (file://)

---

## خطوات النشر السريعة (عربي): المستودع `yousefharby/Yousef`

رابط الموقع بعد النشر: **https://yousefharby.github.io/Yousef/**. الرابط مضبوط جاهز داخل الملفات.

رفع الملفات من المتصفح يقبل 100 ملف كحد أقصى في المرة، والموقع 111 ملف، فالرفع على دفعتين:

1. سجّل دخول بحساب **yousefharby** وافتح https://github.com/yousefharby/Yousef
2. **الدفعة الأولى:** اضغط **uploading an existing file**، ثم افتح مجلد `yousef-portfolio` على جهازك، وحدّد **كل حاجة ما عدا مجلد `public`**، واسحبها لصفحة الرفع. بعدها اضغط **Commit changes**.
3. **الدفعة الثانية:** من **Add file ← Upload files** اسحب **مجلد `public`** كله، ثم **Commit changes**.
4. من **Settings ← Pages**: اختر **Deploy from a branch**، ثم **Branch: `main`** و **`/ (root)`**، ثم **Save**.
5. بعد دقيقة أو اتنين افتح https://yousefharby.github.io/Yousef/

لازم تسحب **المجلدات نفسها** (css وjs وvendor وpublic)، مش الملفات اللي جواها، عشان المسارات تفضل صحيحة.

---

## File tree

```
yousef-portfolio/
├── index.html              ← the whole page (English copy lives here)
├── 404.html                ← self-contained "page not found" (works for user & project sites)
├── favicon.ico
├── site.webmanifest
├── robots.txt              ← [EDIT] URL
├── sitemap.xml             ← [EDIT] URL
├── .nojekyll               ← tells GitHub Pages to serve files as-is
├── css/
│   └── main.css            ← design tokens, layout, RTL, responsive, reduced-motion
├── js/
│   ├── i18n.js             ← Arabic translations + UI strings
│   ├── data.js             ← case-study content for the overlay (EN + AR)
│   └── main.js             ← preloader, hero, gallery, overlay, motion, language switch
├── vendor/
│   ├── gsap/               ← gsap.min.js, ScrollTrigger.min.js, SplitText.min.js (3.15.0)
│   └── lenis/              ← lenis.min.js (1.3.26)
├── public/
│   ├── fonts/              ← woff2 files + license note
│   ├── icons/              ← favicon.svg, apple-touch-icon, 192/512 PWA icons
│   ├── img/                ← cut-out portrait (webp+png), red rim-light glow, og-image.jpg
│   ├── work/               ← 8 website screenshots, browser chrome removed (640/960/1265 · webp+jpg)
│   └── systems/            ← dashboard + Telegram layers used by the animated mockups
└── tools/                  ← asset pipeline (not needed at runtime)
    ├── cutout_photo.py     ← background removal (rembg + hair-aware matting)
    ├── process_assets.py   ← crops screenshots, exports WebP/fallbacks, Telegram layers, glow
    ├── trace_mask.py       ← turns the shirt mask into the inline SVG used in main.css
    ├── yousef-body-mask.png
    ├── og-image.html       ← 1200×630 social-share card template
    └── render-og.mjs       ← renders og-image.html with Playwright
```

---

## Things to edit — `[EDIT]` checklist

| Where | What | Currently |
|---|---|---|
| `index.html` (head + JSON-LD), `robots.txt`, `sitemap.xml` | Site URL. Already set; change only if the site moves | `https://yousefharby.github.io/Yousef/` |
| `index.html` → hero stats | Years of experience | `2+` (placeholder) |
| `index.html` → hero stats | Projects completed | `8+` (the distinct builds on this page) |
| `index.html` → hero stats | Happy clients | `5+` (placeholder) |
| `index.html` → "Selected work · 2024 — 2026" | Year range of your work | 2024 — 2026 |
| `index.html` + `js/data.js` | Year of projects 02, 03, 05, 06, 07, 08 | 2026, 2026, 2025, 2026, 2024, 2025 (guesses) |
| `js/data.js` → Sedra Store `role` | Add "Ads" if you ran its campaigns | Design · Development · Automation |
| `index.html` → Skills (commented block) | Optional Education block | hidden |
| `index.html` → Contact "Based in" | Optional city | Egypt · working worldwide |

Arabic versions of the same strings are in `js/i18n.js` (same keys as the `data-i18n` attributes).

The real numbers used (9.5K+ visitors, 330+ order-form opens, 180+ orders, 1.9% conversion; Cairo 110 · Giza 41 · Qalyubia 8 · Alexandria 8) come straight from the Sedra Store dashboard screenshot. The customer-data blur in the Telegram screenshots is untouched.

---

## Editing content

- **English text:** edit it directly in `index.html`.
- **Arabic text:** edit `js/i18n.js`. Every key matches a `data-i18n="…"` attribute in the HTML.
- **Case-study overlay** (text, stack, metrics): edit `js/data.js`.
- **Adding a project:** copy one `<li class="project">` block in `index.html`, add images to `public/work/` (`name-640/960/1265.webp|jpg`), and add an entry to `js/data.js` with the same id.
- **Language:** the EN/AR button remembers the choice. Share `?lang=ar` to open the Arabic version directly.

## Preview locally

Double-clicking `index.html` works. For the most accurate preview, serve the folder:

```bash
cd yousef-portfolio
python3 -m http.server 8000      # then open http://localhost:8000
```

## Deploy to GitHub Pages (English)

1. Create a **public** repository at https://github.com/new.
   - Name it `<your-username>.github.io` to get `https://<your-username>.github.io/`, or
   - give it any name (e.g. `portfolio`) to get `https://<your-username>.github.io/portfolio/`.
2. Upload the **contents** of this folder (not the folder itself) to the repository root. In the browser
   (*Add file → Upload files*, max 100 files per upload) do it in two batches: everything except `public/`,
   then `public/`. Or use git:
   ```bash
   cd yousef-portfolio
   git init && git add . && git commit -m "Portfolio"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo>.git
   git push -u origin main
   ```
3. Go to **Settings → Pages → Build and deployment**, set **Source: Deploy from a branch**, then **Branch: `main` / `(root)`**, and click **Save**.
4. After a minute or two the live URL appears at the top of the Pages settings.
5. The site URL is preset to `https://yousefharby.github.io/Yousef/`. If you deploy somewhere else, replace it (see the checklist) so Open Graph previews and the sitemap point to the right place.
6. *(Optional custom domain)* In Settings → Pages → Custom domain, enter your domain, then add the DNS records GitHub shows you.

All paths are relative, so the site works both at a domain root and under `/<repo>/`.

## Regenerating assets (only if you change photos/screenshots)

```bash
pip install "rembg[cpu]" pymatting opencv-python-headless pillow numpy
python3 tools/cutout_photo.py path/to/yousef-photo.jpg tools/
python3 tools/process_assets.py path/to/assets . tools/yousef-cutout-full.png
python3 tools/trace_mask.py tools/yousef-body-mask.png 959 1169   # paste output into --shirt-mask in css/main.css
```

Screenshots must be 1280×1024 browser captures. The script crops the viewport `(0, 87) → (1265, 984)`, which removes the tabs, address bar, scrollbar and Windows taskbar.

## Credits & licenses

- GSAP & plugins: GreenSock "Standard No-Charge License" (free, including commercial use), https://gsap.com/standard-license
- Lenis: MIT, by darkroom.engineering
- Fonts: SIL Open Font License 1.1 (see `public/fonts/README.txt`)
- Icons: Feather (MIT) and Font Awesome brand icons (CC BY 4.0), inlined as an SVG sprite
