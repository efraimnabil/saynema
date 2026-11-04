# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = ["faster-whisper>=1.1"]
# ///
"""Word-timed transcript with faster-whisper, on this computer (any OS).

    uv run scripts/whisper.py <audio.wav> [model] [language|auto]

Prints one JSON line: {"text": ..., "words": [{"t","s","e","k"}]}. The first
run downloads the model (large-v3-turbo is about 1.6 GB) to the Hugging Face cache.
"""
import json, sys
from faster_whisper import WhisperModel

audio = sys.argv[1]
model_name = sys.argv[2] if len(sys.argv) > 2 else "large-v3-turbo"
lang = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != "auto" else None

model = WhisperModel(model_name, device="auto", compute_type="auto")
# No VAD filter: the pauses must keep their real length, cut.mjs removes them.
segments, info = model.transcribe(audio, language=lang, word_timestamps=True, vad_filter=False, condition_on_previous_text=False)
words, text = [], []
for seg in segments:
    text.append(seg.text.strip())
    for w in seg.words or []:
        t = w.word.strip()
        if t:
            words.append({"t": t, "s": round(w.start, 3), "e": round(w.end, 3), "k": "word"})
print(json.dumps({"text": " ".join(text), "words": words, "language": info.language}, ensure_ascii=False))
