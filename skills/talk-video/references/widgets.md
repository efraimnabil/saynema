# Widgets

One widget per scene, drawn between the caption and the face. They show the
**shape** of an idea (rows as grey bars, a line going up, a box ticked); only
tags, labels and numbers are read. All text comes from the props, in the
video's language. Numbers are written in the brand's digits automatically.

Pick by what the sentence **does**, not by its words:

| the sentence… | widget |
|---|---|
| asks a question | `question` |
| names a pain, a mess | `messy` |
| says the old way is over | `crossed` |
| says A becomes B, X connects to Y | `tiles` |
| introduces the speaker | `nametag` |
| gives one big figure (a price, a date, "free") | `big` |
| gives a total that grows (money, users) | `counter` |
| says something improves over time | `chart` |
| lists items with a status (paid/owes, done/late) | `tags` |
| says things get checked off (attendance, tasks) | `checks` |
| walks through days or steps | `steps` |
| lists 2–4 features or benefits | `icons` |
| names groups, categories, plans | `cards` |
| talks about people, users, a community | `people` |
| says someone sees it on their phone | `phone` |
| says a file or sheet turns into something clean | `file` |
| mentions support, a team, a conversation | `chat` |
| a quote or a one-line promise | `quote` |
| the call to action ("tap", "message us") | `button` |
| the sign-off, the brand | `logo` |

Don't use the same widget twice in a row. `tiles`, `big` and `counter` can
come back later in the video.

## Props

`steps` (optional, every widget) = seconds on the final timeline of the words it reacts to.

| kind | props | steps |
|---|---|---|
| `question` | `text` (default `?` / `؟`) | — |
| `messy` | — | — |
| `crossed` | `badge`, `icon` (an icon instead of the paper sheet) | [0] when it gets crossed |
| `tiles` | `from`, `to` (icon names or `"logo"`), `badge` | [0] link starts, [1] badge shows |
| `nametag` | `name`, `role` | — |
| `big` | `big` (text or number), `label`, `unit`, `badge` | — |
| `counter` | `to` (number), `unit`, `header`, `badge` | — |
| `chart` | `points` (0–100, left to right, 4–7 of them), `header`, `badge` | — |
| `tags` | `header`, `clock`, `rows: [{tag, tone}]` (2–5 rows; tone `ok`/`bad`/`accent`/`light`) | — |
| `checks` | `header`, `total` (number for the n / total counter), `off` (label of the one row left unticked, e.g. "absent"; omit for none) | — |
| `steps` | `header`, `labels` (3–7 short labels, e.g. day initials) | — |
| `icons` | `icons` (2–4 names), `labels`, `badge` | one per icon: when it lights |
| `cards` | `labels` (3), `counts` (3 numbers), `unit` | — |
| `people` | `count` (1–6), `badge` | — |
| `phone` | `tabs` (2–4 labels), `who` (who's looking), `icon` | one per tab: when it's named |
| `file` | `file` (its name), `header`, `icon` (default `sheet`) | — |
| `chat` | `header`, `badge` | — |
| `quote` | `text` (≤ 60 characters), `by` | — |
| `button` | `label`, `done`, `icon` | [0] the click (a tap sound plays) |
| `logo` | `title`, `badge` | — |

Icon names: notebook, money, people, person, phone, file, sheet, list, chat,
clock, calendar, chart, check, mail, lock, rocket, star, home, cart, code,
bolt, heart, gear, search, video, mic, and `logo` (the brand logo) where a
prop takes an icon.

Badges are short: 1–4 words. A `✓` at the start reads as done.

## Never

- An example number ("4,800", "+340") the user didn't say. If the sentence
  has no number, use a widget without one.
- A chart that goes down when they said it went up: `points` run left to
  right in time.
