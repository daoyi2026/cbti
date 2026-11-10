# CBTI / PAWSONA

A mobile-first cat-personality quiz with animated 3D characters and real public adoption records. The interface is in Chinese. This repository contains the current local prototype as a standalone static website.

## Run locally

Requirements: Python 3. Node.js 20+ is needed only for the checks. No dependency installation or build step is required.

```sh
python3 scripts/serve.py
```

Open `http://127.0.0.1:4178/`. Set `PORT` to use another port. Serve over HTTP rather than opening `index.html` directly, because the app uses ES modules and WebGL asset loading.

## Experience

1. Start from the homepage and answer eight questions, each with five choices.
2. Submit the last answer to reveal the personality card. Results describe the human user's fictional cat persona, not a real cat's breed or temperament.
3. Draw a real cat's public adoption record. The turning card itself reveals the original photo, name, recorded temperament, and original listing link. The user's personality result remains unchanged behind it.
4. Save the personality card as a 1080 × 1920 PNG, or explore the twelve-persona field guide.

`?sample=VIP` and `?sample=MUSE` are optional direct personality-card previews. They bypass the questionnaire deliberately. The normal root URL starts the full experience.

## Models and runtime

Eight Draco-compressed animated GLBs are bundled under `assets/models`, each below 10 MB. Only the displayed character is loaded. Ear/blink loops remain independent of character actions. CHAOS, BUFF, FOOD, and GLAM still have an explicit artwork-pending state. Existing supplied 3D geometry and textures are preserved.

Three.js, its loaders, the Draco decoder, and the portrait portal are vendored, so the 3D experience does not depend on another local project or an external script CDN. Relative resource paths support both a domain root and a repository subdirectory. Publishing/hosting is not automatically enabled by this repository.

## Scoring

The eight-question scoring uses primary and secondary affinities, opportunity normalization, fixed calibration, and deterministic tie handling. All 390,625 equally likely answer combinations were enumerated: the twelve result shares range from 8.004864% to 8.566272%. This is a uniform-choice property; actual human preferences need not be uniform. Identical answers give identical results. Breed/color memes are fictional role inspiration, not scientific personality claims.

## Adoption data

`adoption-snapshot.js` preserves six public records originally collected from the Shenzhen Dog Protection Association website on 2026-10-21. Official-site search results checked on 2026-11-10 still listed those cats as awaiting adoption. Actual availability has not been confirmed with the rescuers; the UI preserves that uncertainty and original-source links. There is no partnership or live status API.

Five single-cat records are eligible for equal-probability draws. The shared two-cat record remains in the gallery only. Adopted/unlisted records are excluded; an empty pool is handled explicitly. Repeat draws may repeat a cat. Drawing does not reserve an animal or apply for adoption. The draw does not infer compatibility from breed or the user's persona.

Photos remain remote original-source images, with a visible fallback if unavailable. A network connection is required for those images and external adoption details. Other runtime assets are bundled locally. No backend, account system, analytics, or persistence service is configured.

## Checks

```sh
npm run check
```

Checks cover bundled resource references, GLB hashes and sizes, all questionnaire outcomes and their distribution, single-cat draw eligibility, original-image/listing correspondence, invalid random values, and empty/adopted pools. Generated reports are local and ignored by Git.

The local browser flow was checked at desktop and narrow mobile viewport sizes, including answer reveal, the real-cat card, repeated draws, canceling a flip, unchanged personality results, and PNG download. Physical-phone performance and subjective animation quality still need device/user review.

## Third-party and supplied assets

- Three.js and its example loaders: MIT; notice in `assets/vendor/THREE-LICENSE.txt`.
- Draco decoder: Apache-2.0; notice in `assets/vendor/draco/LICENSE.txt`.
- Models and portal artwork were supplied or previously prepared for this project. No additional open-source license is granted to those assets by this README.
- Adoption photos and record content belong to their original publishers; original links and attribution are retained.
