# edit.json — picking takes and cutting

## Format

```json
{
  "segments": [
    { "beat": 1, "take": "09", "parts": [[0.86, 5.26]] },
    { "beat": 2, "take": "11", "parts": [[0.92, 1.68], [2.26, 5.94]] }
  ]
}
```

- Segments play in order. `take` is the two-digit number of
  `transcripts/takeNN.json`. `parts` are `[start, end]` seconds **inside that take**.
- Several parts in one segment = the same take with a gap removed.
- An idea may use parts of two different takes (two segments with the same
  `beat`): only when one take has the better first half and another the
  better second half.

## How to choose

For each idea (in beats order), read every take that covers it (`beat` and
`marks` tell you which; a take may run across several ideas after Enter).

Prefer, in this order:
1. Complete: says the whole idea, no sentence left hanging.
2. Fluent: fewest restarts and fillers.
3. Energy: the more natural, more confident one.
4. Later takes, when equal (people warm up).

## How to cut

Use the word times (`s`, `e`) from the transcript.

- **Start** a part 0.08 s before its first word; **end** it 0.12 s after its
  last word. Never cut inside a word.
- **Remove**: fillers ("uh", "um", "آآ", "إممم", "يعني" when it's only
  filler), false starts ("so the — so the app…" keep the second), repeats,
  and any pause longer than ~0.35 s (cut it down, keep ~0.15 s).
- **Keep** breaths and pauses that carry meaning (before a punchline).
- `k: "event"` words are sounds (laughter, a cough): cut coughs, keep a laugh
  if it's warm.
- Don't make parts shorter than ~0.4 s unless needed: many tiny parts look
  jumpy. The video punches in on every other cut to hide the jumps.

After `npm run cut -- <id>`, tell the user the new length and what you
dropped, in one or two lines.
