---
name: make
description: Turn the recorded takes of a video into the finished video (transcribe, cut, cut-out, scenes, render)
argument-hint: "<video id>"
disable-model-invocation: true
allowed-tools: Bash(npm run *)
---

Read `${CLAUDE_PLUGIN_ROOT}/skills/talk-video/SKILL.md`. Make the video
`$ARGUMENTS` from its recorded takes: run the doctor first, then follow
**Make a video** from step 3 (transcribe) to step 7 (check, then render). If no
id is given, list `videos/` in the studio and ask which one.
