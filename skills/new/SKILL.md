---
name: new
description: Start a new talking-head video - write the talking points and open the recording studio
argument-hint: "<what the video is about>"
disable-model-invocation: true
allowed-tools: Bash(npm run *)
---

Read `${CLAUDE_PLUGIN_ROOT}/skills/saynema/SKILL.md`. Start a new video about:
$ARGUMENTS

Follow **Make a video**, steps 1 (ideas) and 2 (record). Stop after starting
the recorder and wait for the user to say they finished recording.
