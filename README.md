# talk-video

A Claude Code plugin. You talk to your laptop camera; Claude turns it into a
vertical video (Reels, TikTok, Shorts): your head pops out of a card, and every
sentence gets its own animated widget. Arabic or English.

## Install

In Claude Code:

```
/plugin marketplace add efraimnabil/talk-video
/plugin install talk-video@efraimnabil
```

Claude Desktop (Code tab): run the same two lines in your computer's terminal
as `claude plugin marketplace add efraimnabil/talk-video` and
`claude plugin install talk-video@efraimnabil`, then open a new session.

Then run `/talk-video:setup`. It asks four questions once, installs only what's
missing (with your OK), and shows you an example.

**Update:** `claude plugin update talk-video@efraimnabil`, then
`/talk-video:setup` again (your videos and settings stay).

## Use

| | |
|---|---|
| `/talk-video:new <topic>` | Writes short talking points (not a script) and opens the recording studio. **Space** records, **Enter** shows the next point. |
| `/talk-video:make <id>` | Picks your best takes, cuts the "umm"s, cuts you out, adds the widgets and renders `videos/<id>/out/<id>.mp4`. |
| `/talk-video:doctor` | Checks your setup. |

You post the video yourself; the plugin never publishes anything.

## Needs

Node 20+, ffmpeg, and uv. Transcription: ElevenLabs Scribe (paid, best for
Arabic dialects) or Whisper on your computer (free). Cut-out: Apple Vision on
macOS or MediaPipe anywhere. Video: [Remotion](https://remotion.dev), free for
individuals and small companies; bigger companies need a
[license](https://remotion.pro).

Recordings stay on your computer. Only with ElevenLabs is audio sent out, for
transcription.

**Works in** Claude Code (terminal or Claude Desktop's Code tab), not in the
claude.ai chat or Claude Code on the web: those can't reach your camera or files.
Tested on macOS; Windows and Linux should work but are untested.

## بالعربي

بتتكلم قدام الكاميرا، وClaude يطلّع لك فيديو طولي: راسك طالعة من كارت، وكل جملة ليها رسمة متحركة.

التنصيب في Claude Code: السطرين اللي فوق تحت **Install**، وبعدهم `/talk-video:setup`. ولو بتستخدم Claude Desktop، اكتبهم في Terminal الجهاز بـ `claude plugin` بدل `/plugin`.

فيديو جديد: `/talk-video:new` وبعدها الموضوع. ولما تخلّص التسجيل: `/talk-video:make` واسم الفيديو.

---

Made by [Efraim Nabil](https://github.com/efraimnabil). MIT license.
