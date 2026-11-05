# Setup

Goal: a working studio folder and one example video on screen, in about ten
minutes, with as few questions as possible.

## 1. Look before you ask

Run these and keep the answers (don't print them back as a wall of text):

- OS: `node -p process.platform` (`darwin`, `win32`, `linux`)
- Node: `node --version` (needs 20.19+)
- ffmpeg: `ffmpeg -version` and whether `ffmpeg -hide_banner -encoders` lists `libvpx-vp9`
- uv: `uv --version`
- macOS only: `swift --version`
- An existing studio: `~/.saynema.json`. If it points to a folder that
  exists, this is most likely an **update** (the plugin was updated, or doctor
  said the template is old). Ask in one line: update that studio, or make a new
  one? To update, skip to step 4 and run `init.mjs` with only the folder: it
  keeps their choices, brand, key and videos. Then skip step 5.

## 2. Ask once

One `AskUserQuestion` call with these questions (skip any whose answer is
already obvious, e.g. no cutout question off macOS):

1. **Language of your videos** — Arabic (right-to-left, Arabic digits) /
   English / Other (they type it; any language Whisper or Scribe knows works,
   captions follow its direction).
2. **Transcription** —
   - ElevenLabs Scribe *(recommended for Arabic and other dialects)*: most
     accurate, paid per minute, needs an API key.
   - Whisper on this computer: free and private, slower, a bit weaker on
     dialects; downloads a 1.6 GB model once.
3. **Cut-out** (macOS only) — Apple Vision *(recommended: built in, cleanest
   edges)* / MediaPipe (same as Windows and Linux). Off macOS it is always MediaPipe.
4. **Studio folder** — `~/saynema-studio` *(recommended)* / this folder.

## 3. Install only what's missing

Show the command and say in one line what it is. Let the user approve each.

| Tool | macOS | Windows | Linux |
|---|---|---|---|
| Node 20+ | `brew install node` | `winget install OpenJS.NodeJS.LTS` | nodejs.org or the distro package |
| ffmpeg | `brew install ffmpeg` | `winget install Gyan.FFmpeg` | `sudo apt install ffmpeg` |
| uv (for Whisper / MediaPipe) | `brew install uv` | `winget install astral-sh.uv` | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| Swift (Apple cut-out) | `xcode-select --install` | — | — |

No Homebrew on a Mac? Say so and point to https://brew.sh rather than
installing it unasked. After a winget install on Windows, a new terminal is
needed before the tool is on PATH: tell the user, then re-check.

## 4. Make the studio

```
node "ENGINE/scripts/init.mjs" "<studio folder>" --language <ar|en|…> --transcriber <elevenlabs|whisper> --cutout <apple|mediapipe>
cd "<studio folder>" && npm install
npm run doctor -- --plugin "PLUGIN"
```

`init.mjs` is safe to run again: it replaces the template code and keeps the
user's `brand.json`, `.env`, config choices and videos.

If they chose ElevenLabs: tell them to open `<studio>/.env` in their editor
and paste the key after `ELEVENLABS_API_KEY=` (from elevenlabs.io → Developers
→ API keys). Never ask for the key in the chat. Re-run `npm run doctor`.

## 5. Brand

Ask for: the brand or channel name, one accent colour (or a website to take it
from: read the site's main colour), and optionally a square logo file. Copy the
logo to `<studio>/public/brand/logo.png` and set `brand.json` (see brand.md).
Skipping is fine: the defaults look good.

## 6. Show a result

```
npm run stills -- example
```

Read two or three of `videos/example/out/stills/*.png` and show them (send the
files). This example has no face, it shows the widgets. Then say what's next:
"tell me what your first video is about".

## 7. One honest note

Remotion (the video engine) is free for individuals and companies of up to 3
people; bigger companies need a Remotion company license (remotion.pro). Say
this once, in one line, at the end of setup.
