# video.json — the scenes

```json
{
  "clip": "clips/<id>",
  "tail": 0.6,
  "scenes": [
    {
      "from": 0,
      "face": "card",
      "caption": ["6 months ago,", "teachers dropped the notebook."],
      "accent": ["notebook."],
      "widget": { "kind": "crossed", "steps": [2.0], "badge": "6 months" }
    }
  ]
}
```

- `clip`: always `clips/<id>`. (`null` = a widget demo with no face.)
- `tail`: seconds of hold after the last word.
- `sfx`: `false` turns off the whoosh between scenes and the button tap.

## A scene

| field | what |
|---|---|
| `from` | seconds on the **final** timeline (`public/clips/<id>/talk.json` → `words[].s`). Use the start of the scene's first word, minus ~0.05. The first scene starts at 0. |
| `caption` | 1 or 2 lines, what they say, shortened. ~22 characters per line at most; split where they'd breathe. Same language and spelling as spoken (dialect stays dialect). |
| `accent` | 1–2 words of the caption in the accent colour, written **exactly** as in the caption (punctuation included is fine). The key word, usually the last. |
| `face` | `card`, `bleed` or `hidden` (below). |
| `widget` | `{ "kind": …, "steps": [...], …props }`, see widgets.md. |
| `widget.steps` | seconds on the final timeline of spoken words the widget reacts to (a cross-out on "notebook", a click on "now"). Optional. |

One scene per sentence, or per half-sentence when a sentence carries two
ideas. Scenes shorter than ~1.2 s flash by: merge them. Longer than ~5 s
feels static: split them.

## Face states

- `card`: the face in a rounded card at the bottom, the head popping out over
  its top edge. The default; most scenes.
- `bleed`: the face fills the bottom half, edge to edge. For personal
  moments: who I am, a story, a promise. Use for 2–4 scenes, not in a row
  of more than two.
- `hidden`: no face; the widget moves to the middle, a little bigger. For
  data-heavy widgets (a counter, a chart) that need the room. At most 1 in 5 scenes.

Changing state animates smoothly, so alternating is good: it keeps the eye busy.

## Check before rendering

- Every number and name on screen is in `talk.json`'s words or was given by the user.
- Captions match what's said (a viewer with sound off must get the message).
- `from` values increase; no scene starts before the previous one.
- Then `npm run stills -- <id>` and read every still.
