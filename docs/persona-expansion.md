# Eleven-persona model update

The four previous unmodeled roles are removed from active data, questions, scores, and the field guide. The eight existing modeled roles remain. All eleven active outcomes now have their own animated model.

## New roles

| Code | Representative | Role | Distinction |
| --- | --- | --- | --- |
| SCOUT | Singapura | Pocket scout | Small but eager to try, playful initiative; distinct from LOOK's indoor inspection |
| BOSS | American Shorthair | Trophy squatter | Confident personal boundaries and ownership of a stage; distinct from CTRL's scheduling and TANK's protective loyalty |
| WILD | Forest cat | Hidden wilderness explorer | Independent exploration and willingness to leave familiar routes; distinct from AFK's quiet recovery |

Breed/color cues are fictional character inspiration. They do not classify the temperament or adoption suitability of real cats.

## Model identity and preparation

Opaque filenames were matched by visual inspection, not by the order supplied:

| Source ID | Identity | Runtime file | Bytes |
| --- | --- | --- | ---: |
| `09d01e7d96ff34d56eaa22e4b542f9af` | Singapura, butterfly on nose | `scout-motion.glb` | 6,759,556 |
| `25574dae821d1877f5cbda4a7df182bd` | Forest cat standing on rock | `wild-motion.glb` | 6,515,644 |
| `f89060cb160d668f0f5780c366abb74b` | American Shorthair resting on trophy | `boss-motion.glb` | 7,254,736 |

The source meshes were approximately 1.5 million triangles each. The runtime versions contain approximately 600,000 triangles, Draco compression, 4K JPEG base-color textures, and eight-joint skins. Each contains independent `Living` ear/blink and `Breathe` loops plus three additive interaction gestures. Trophy, floor contacts, and the forest rock remain anchored. Supplied source files are unchanged and are not committed to this repository.

Validation reports for all three exports contain zero errors, with one existing generated-tangent warning each. Front, side, back, blink, and gesture contact sheets were visually reviewed. Model size and hash verification is part of `npm run check`.

## Questionnaire changes

The questionnaire stays at eight human-life questions with five choices each. Travel choices separate planning, safety, comfort, making a creative travel film, and taking a solo mountain route. The evening-recovery question contrasts resting, solitary entertainment, physical activity, talking, and making things. Replies to a distressed friend contrast taking their side, analyzing, postponing honestly, sharing one's own story, and distraction. Empty-box choices ask for the first action after unpacking, rather than overlapping reasons for keeping it. Imperfect reactions remain valid choices. Primary WILD choices are now questions 1, 3, and 7, all explicitly about independent exploration. All forty affinity mappings were reviewed after the copy changes.

WILD requires at least two primary explorer choices and competes by affinity score. It is not a random lottery result. Calibration targets a 3% uniform-choice share for WILD and 9.7% for each standard role. Enumerating every one of the 390,625 answer combinations produced:

- Standard roles: 9.3056%–10.296832% each.
- WILD: 2.882816% (11,261 paths).

Actual users need not choose options uniformly. Equal answer sets always give the same result. Hidden status appears on the result page, answer modal, field guide, and exported personality card. Real adoption draws remain separate and unchanged.
