---
name: Image serving & resizing
description: Why gallery images broke on mobile and how /objects image resizing works
---
Uploaded photos are stored at original size (often 3–7 MB). On mobile networks these downloads time out, showing broken-image icons.

**Rule:** any `<img>` pointing at `/objects/...` should request a resized variant via `?w=` (allowed widths only: 400, 800, 1600 — others serve the original). The server pipes through sharp on the fly (JPEG q80, EXIF rotate); originals are never modified.

**Why:** user reported broken gallery images on phone (Aug 2026); all URLs returned 200 but were 2.5–6.7 MB each.

**How to apply:** Gallery grid uses w=800, lightbox w=1600. News/products/band pages still load originals — apply the same pattern if similar reports come in.

## Large files in production (videos)
Replit deployment proxy rejects responses over ~32 MB with an instant 500 (0 bytes, no app logs — request never reaches Express). Any `/objects/...` file over 25 MB or with `video/*` MIME is 302-redirected to a 1h signed GCS URL instead of streamed through the app.

**Why:** uploaded 50 MB gallery video returned 500 in prod but 200 in dev (Aug 2026); no server-side error was logged, which is the telltale sign the proxy blocked it.
