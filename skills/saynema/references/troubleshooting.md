# Troubleshooting

Run `npm run doctor` first.

| symptom | cause | fix |
|---|---|---|
| Recorder page: "needs camera and mic access" | Permission denied, or another app holds the camera | Allow it in the browser's site settings; quit Zoom/Teams/FaceTime. Open `http://localhost:4310`, not `127.0.0.1`. |
| Recorder: sound says "background noise" | Fan, AC, open window | Turn it off or move; noise is cleaned a little in `cut`, not removed. |
| `transcribe`: ElevenLabs 401 | Key missing or wrong in `.env` | User fixes `.env`; never ask for the key in chat. |
| `transcribe` (whisper) is slow | First run downloads the model; CPU transcription | Normal: about real time on a laptop. `"whisperModel": "small"` in the config is faster and weaker. |
| Transcript in the wrong language | Auto-detect missed | Set `"language"` in `saynema.config.json`, delete the transcript, run again. |
| `cut`: "Part … is empty" | A part with end ≤ start in edit.json | Fix the times. |
| `matte` (apple) fails on swift | No Xcode command line tools | `xcode-select --install`. |
| `matte` (mediapipe): uv not found | uv missing or terminal not restarted | Install uv; on Windows open a new terminal. |
| Head pops out wrong / cut off | The head is too low or too high in the camera frame | Re-record with the head in the recorder's green band. Or edit `headTop` (px from the top of the 1920×1080 frame) for that cut in `public/clips/<id>/talk.json`. |
| Cut-out edges fringe or flicker | Busy background, backlight | Plain wall, light in front. On macOS, `"cutout": "apple"` has cleaner edges. |
| Render: Chrome crashes at start on macOS | Remotion's downloaded browser vs. new macOS | Install Google Chrome; the studio uses it automatically. `SAYNEMA_CHROME` forces a path. |
| Wrong font in the video | `font` isn't a Google Fonts family name | Fix the exact name in brand.json. |
| `unknown widget: …` on a still | A typo in `kind` | See widgets.md. |
| Caption runs off the screen | Line too long | ≤ ~22 characters per line, 2 lines max. |
