---
name: talk-video
description: Make a vertical talking-head video (Reels, TikTok, Shorts) from the user recording themselves - their head pops out of a card and every sentence gets an animated widget. Covers setup (Remotion, transcription, cutout), writing talking points, the recording studio, picking takes and cutting fillers, the cutout, the scenes, and the render. Use when the user wants to set up talk-video, make or edit a talking-head / face-to-camera video, record themselves for a video, or asks for "a video like that one with my head popping out".
argument-hint: "[setup | doctor | new <topic> | make <id>]"
---

# talk-video

The user talks to their camera; you turn the takes into a finished 1080×1920
video. Their words drive everything: each sentence becomes a scene with a
caption and one widget, and their head breaks out of a card at the bottom.

**Talk to the user in their language** (match the language they write in).
Keep the jargon out: say "cut-out", not "segmentation matte".

## Where things are

- **The engine** (template, scripts, recorder) ships with this plugin at
  `<skill base directory>/../../engine`. Call that `ENGINE`.
- **The studio** is the user's own folder, made from the engine by setup.
  Its path is in `~/.talk-video.json` (`{"studio": "..."}`). Call it `STUDIO`.
  Every `npm run …` below runs inside `STUDIO`.
- One video = `STUDIO/videos/<id>/`: `beats.md` → `takes/` → `transcripts/` →
  `edit.json` → `video.json` → `out/<id>.mp4`. Its media for rendering is in
  `STUDIO/public/clips/<id>/`.

If `~/.talk-video.json` is missing or its folder is gone, run **Setup** first.

## The rules that make it good

1. **Points, not a script.** The user speaks naturally. You write short ideas
   for the prompter, never sentences for them to read.
2. **Never invent facts.** Every number, name, price or claim on screen must
   come from the user's own words (the transcript) or from them directly.
   When a widget needs a number they didn't say, ask, or pick a widget
   without one. Example numbers are a bug, not a placeholder.
3. **Text never bounces, blurs or shakes.** The widgets already obey this;
   don't add effects that break it.
4. **Look before you render.** Render stills, look at every one, fix, then
   render the video.
5. **You never publish.** Hand over the file and a caption; the user posts.
6. **Secrets stay out of the chat.** API keys go in `STUDIO/.env`, typed by
   the user. Never ask them to paste a key into the conversation, never print one.

## Setup (`/talk-video:setup`)

Read [references/setup.md](references/setup.md) and follow it. In short:
detect what's installed, ask everything in **one** `AskUserQuestion` call
(language, transcription, cutout, studio folder), install only what's missing
(show each install command, explain it in a line, let the user approve), run
`node ENGINE/scripts/init.mjs`, `npm install`, `npm run doctor`, set the brand,
and show the example video's stills so they see a result in minutes.

## Doctor (`/talk-video:doctor`)

`npm run doctor -- --json` in `STUDIO`. Explain each ✗ in one plain line with
its fix. Don't install anything without the user's go-ahead.

## Make a video

### 1. Ideas (`/talk-video:new <topic>`)

Ask what the video is about, who it's for, and what the viewer should do at
the end (follow, comment, visit, message). Ask for any facts you'll need
(numbers, names, prices). Then write `STUDIO/videos/<id>/beats.md`: see
[references/beats.md](references/beats.md). `<id>` is short, letters/digits/`-`.
Show the ideas to the user and adjust before recording.

### 2. Record

Start the studio in the background: `npm run record -- <id>` (port 4310), and
tell the user to open `http://localhost:4310` in Chrome or Edge. Explain the
keys in one line: **Space** starts/stops a take, **Enter** moves to the next
idea. The page checks light, sound and framing and lists what to fix.

Tell them: one take per idea is fine, several takes are better, mistakes are
fine (just pause and say it again). Wait until they say they're done.

### 3. Transcribe

`npm run transcribe -- <id>`. Read every `transcripts/takeNN.json`. Each has
`beat` (the idea it started on), `marks` (when they pressed Enter), `text` and
`words` with times. If the language looks wrong or garbled, say so before going on.

### 4. Edit: pick takes, cut the fillers

Write `videos/<id>/edit.json`: see [references/edit.md](references/edit.md).
Best take per idea, in idea order; drop fillers, false starts, repeats and
long pauses. Then `npm run cut -- <id>` and tell the user the new length.

### 5. Cut-out

`npm run matte -- <id>` (a few minutes; run it in the background). It also
finds where the head is after every cut.

### 6. Scenes

Write `videos/<id>/video.json` from `public/clips/<id>/talk.json` (its `words`
are on the final timeline). One scene per sentence or half-sentence. See
[references/scenes.md](references/scenes.md) for the format and the face
states, and [references/widgets.md](references/widgets.md) for the widgets.

### 7. Check, then render

`npm run stills -- <id>` writes one still per scene to `out/stills/`. **Read
every still** and fix what you see: caption too long, widget overlapping the
face, a wrong number, an accent on the wrong word. Then
`npm run render -- <id>` (background) → `videos/<id>/out/<id>.mp4`.

Send the file to the user. Offer a short post caption in their voice: two or
three lines, the hook, what it is, the call to action, a couple of hashtags.

## Changing the look

Everything visual comes from `STUDIO/brand.json`: see
[references/brand.md](references/brand.md). Never edit the engine's source for
a brand change.

## When something breaks

[references/troubleshooting.md](references/troubleshooting.md). Run
`npm run doctor` first; most failures are a missing tool or key.
