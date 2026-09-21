# Ramitha & Athokshay Engagement Invitation

A static, GitHub Pages-ready invitation that maps page scroll progress to a single real-world H.264 video timeline. Text chapters are HTML overlays with non-overlapping visibility ranges in `index.html`.

## Preview

Serve this directory over HTTP so browsers can seek the MP4 reliably:

```powershell
python -m http.server 4173 --directory engagement-invitation
```

Open `http://localhost:4173`.

## Media

- `assets/positano-real-journey.mp4`: real aerial footage of Positano by K from [Pexels video 20156101](https://www.pexels.com/video/a-view-of-the-town-of-positano-italy-20156101/), locally encoded as H.264 at 1280x720 with quarter-second keyframes for smooth scroll scrubbing.
- `assets/poster.jpg`: opening frame generated from the same Pexels video.
- Scroll progress scrubs the local video directly; the film has no baked-in invitation text.

The following photographs remain available as source material but are not loaded by the live page:

- `assets/amalfi-bougainvillea.jpg`: bougainvillea-framed Amalfi coastline photograph used for the arrival chapter.
- `assets/positano-flower-pass.jpg`: Positano and foreground bougainvillea photograph by Small Steps from Pexels, photo 19990859.
- `assets/positano-terrace.jpg`: sea-view Positano terrace photograph used as the proposal setting.
- `assets/amalfi-archway.jpg`: Amalfi sea-view arch photograph by Ezgi Kaya from Pexels, photo 33304620.
- `assets/positano-golden-hour.jpg`: golden-hour Positano photograph by Michael Block from Pexels, photo 3225528.
- `assets/positano-twilight.jpg`: illuminated Positano photograph used for the closing chapter.
- To replace the film, keep the same filename or update the relative path in `index.html`. Use H.264 MP4 with yuv420p and fast-start metadata for broad mobile support.

The other images in `assets/` are retained source invitation artwork and are not loaded by the site.