# talk-video

A Claude Code plugin that turns you talking to your laptop camera into a
finished vertical video (Reels, TikTok, Shorts): your head pops out of a card
at the bottom, and every sentence you say gets its own animated widget above it.

You talk. Claude does the rest: the talking points, the recording studio,
picking your best takes, cutting the "umm"s, cutting you out of the
background, choosing a widget for each sentence, and rendering.

Works in **Arabic and English** (and any language the transcriber knows), on
**macOS, Windows and Linux**.

## Install

**Claude Code in a terminal:**

```
/plugin marketplace add efraimnabil/talk-video
/plugin install talk-video@yamistro
```

**Claude Desktop (the Code tab):** run these two lines once in your computer's
terminal (Terminal on macOS, PowerShell on Windows). If `claude` isn't found,
install Claude Code first from [claude.com/claude-code](https://claude.com/claude-code).

```bash
claude plugin marketplace add efraimnabil/talk-video
claude plugin install talk-video@yamistro
```

Then start a new session in the Code tab.

> **Where it works:** Claude Code only (the terminal, or the Code tab in
> Claude Desktop). It does **not** work in the normal chat on claude.ai or in
> Claude Desktop, or in Claude Code on the web: those run in the cloud and
> can't reach your camera, your files or your computer's tools.

Then, in a session:

```
/talk-video:setup
```

Setup checks what you have, asks four questions once (language,
transcription, cut-out, folder), installs only what's missing (with your OK),
and shows you an example video.

## Make a video

```
/talk-video:new how I stopped using paper for my classes
```

Claude writes 6–10 short ideas (not a script: you say them your way) and
opens the recording studio in your browser. **Space** starts and stops a take,
**Enter** shows the next idea. The studio tells you if the light, the sound or
your framing needs fixing.

When you're done:

```
/talk-video:make <id>
```

You get `videos/<id>/out/<id>.mp4` and a suggested caption. You post it
yourself.

`/talk-video:doctor` checks your setup at any time.

## What it uses

| Step | Tool | Cost |
|---|---|---|
| Video | [Remotion](https://remotion.dev) | Free for individuals and companies up to 3 people; larger companies need a [Remotion license](https://remotion.pro) |
| Transcription | ElevenLabs Scribe (best for Arabic dialects) **or** Whisper on your computer | Scribe is paid per minute; Whisper is free |
| Cut-out | Apple Vision on macOS **or** MediaPipe on any OS | Free |
| Everything else | Node 20+, ffmpeg, uv (for Whisper / MediaPipe) | Free |

Your recordings stay on your computer. Only with ElevenLabs is audio sent
out, to ElevenLabs, for transcription.

## Your studio folder

```
talk-video-studio/
  brand.json              your colours, font, logo, direction
  talkvideo.config.json   your setup choices
  .env                    your API key (never shared)
  videos/<id>/            beats.md → takes/ → transcripts/ → edit.json → video.json → out/
```

Change `brand.json` to make it yours. Running setup again updates the template
and keeps your files and videos.

---

## بالعربي

plugin لـ Claude Code: بتتكلم قدام كاميرا اللابتوب، ويطلع لك فيديو طولي جاهز للريلز والتيك توك. راسك طالعة من كارت تحت، وكل جملة بتقولها ليها رسمة متحركة فوقها.

**التنصيب:** جوه Claude Code اكتب السطرين دول، وبعدهم `/talk-video:setup`:

```
/plugin marketplace add efraimnabil/talk-video
/plugin install talk-video@yamistro
```

**لو بتستخدم Claude Desktop (تاب Code):** اكتب السطرين دول مرة واحدة في Terminal الجهاز (على الماك Terminal، وعلى الويندوز PowerShell). وبعدها افتح جلسة جديدة في تاب Code:

```bash
claude plugin marketplace add efraimnabil/talk-video
claude plugin install talk-video@yamistro
```

**شغال فين؟** في Claude Code بس: يا من الـ terminal، يا من تاب Code في Claude Desktop. مش شغال في الشات العادي على claude.ai أو في Claude Desktop، ولا في Claude Code على الويب، لأن دول بيشتغلوا على سيرفر ومش بيوصلوا للكاميرا ولا لملفات جهازك.

**فيديو جديد:** `/talk-video:new` وبعدها موضوعك. Claude هيكتب لك نقط قصيرة تتكلم عليها بطريقتك (مش سكريبت)، ويفتح لك الاستوديو. المسافة (Space) بتبدأ التسجيل وتوقّفه، وEnter بتجيب الفكرة اللي بعدها. ولما تخلّص اكتب `/talk-video:make` واسم الفيديو.

شغال على الماك والويندوز واللينكس. والتفريغ يا إما ElevenLabs (أدق في العامية، وبفلوس) يا إما Whisper على جهازك (ببلاش).

Made by [YaMistro](https://yamistro.com). MIT license.
