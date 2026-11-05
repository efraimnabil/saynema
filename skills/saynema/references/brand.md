# brand.json — the look

In the studio root. The engine reads it at render time; nothing else needs to change.

```json
{
  "name": "My brand",
  "font": "Cairo",
  "direction": "rtl",
  "digits": "arabic",
  "colors": {
    "bg": "#121014", "card": "#1C1A20", "card2": "#24212A",
    "line": "rgba(255,255,255,0.09)", "bar": "rgba(255,255,255,0.16)",
    "text": "#F4F1EC", "dim": "#8E8796",
    "accent": "#F3C170", "onAccent": "#16131A",
    "second": "#9B6CC6", "ok": "#6FCF8A", "bad": "#E8705F"
  },
  "logo": "brand/logo.png",
  "particles": true,
  "grain": true
}
```

| key | what |
|---|---|
| `name` | Shown when there's no logo (its first letter). |
| `font` | Any Google Fonts family name, exactly as on fonts.google.com. Arabic: Cairo, Tajawal, IBM Plex Sans Arabic, Noto Kufi Arabic. Latin: Inter, Poppins, Manrope. |
| `direction` | `rtl` or `ltr`: captions, widget order, which way links fill. |
| `digits` | `arabic` (٠١٢) or `latin` (012). |
| `colors.accent` | The one brand colour: highlighted words, badges, glows. Pick a light, saturated colour; it sits on a dark stage. |
| `colors.onAccent` | Text on accent (badges): near-black for a light accent, white for a dark one. |
| `colors.second` | A soft glow under the widgets. A second brand colour, or a muted cousin of the accent. |
| `colors.bg`, `card`, `card2` | Keep dark: the face and widgets are lit to sit on a dark stage. Tint them toward the accent's hue rather than pure grey. |
| `logo` | A square PNG in `public/`, e.g. `brand/logo.png`; `null` for none. |
| `particles` | Small accent figures drifting at the sides. |
| `grain` | Light film grain over everything. |

From a website: read its main brand colour for `accent`, its font if it is a
Google Font, and keep the stage dark. Show one still after a change.
