// Transcribes every take of a video with word times, so the best take of each
// idea can be picked and the pauses cut.
//
//   node scripts/transcribe.mjs <id>
//
// Provider from saynema.config.json:
//   "elevenlabs"  ElevenLabs Scribe (paid, best on Arabic dialects; ELEVENLABS_API_KEY in .env)
//   "whisper"     faster-whisper on this computer (free, private; needs uv)
//
// Writes videos/<id>/transcripts/takeNN.json: {file, beat, marks, seconds, text, words:[{t,s,e,k}]}.
// Takes already transcribed are skipped; delete a file to redo it.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { config, paths, secret, studio } from "./config.mjs";
import { ffmpeg, run } from "./run.mjs";

const id = process.argv[2];
const p = paths(id);
const cfg = config();
mkdirSync(p.transcripts, { recursive: true });

// ISO 639-1 → the codes each provider wants.
const lang = cfg.language === "auto" ? null : cfg.language;

async function scribe(wav) {
  const key = secret("ELEVENLABS_API_KEY");
  if (!key) throw new Error("ELEVENLABS_API_KEY is missing. Put it in the .env file in your studio folder (never paste it into the chat).");
  const form = new FormData();
  form.append("file", new Blob([readFileSync(wav)], { type: "audio/wav" }), "audio.wav");
  form.append("model_id", "scribe_v2");
  if (lang) form.append("language_code", lang);
  form.append("timestamps_granularity", "word");
  form.append("tag_audio_events", "true");
  for (const term of cfg.keyterms ?? []) form.append("keyterms", term);
  const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", { method: "POST", headers: { "xi-api-key": key }, body: form });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return { text: json.text, words: (json.words ?? []).filter((w) => w.type !== "spacing").map((w) => ({ t: w.text, s: w.start, e: w.end, k: w.type === "word" ? "word" : "event" })) };
}

function whisper(wav) {
  const out = run("uv", ["run", "--quiet", join(studio, "scripts", "whisper.py"), wav, cfg.whisperModel ?? "large-v3-turbo", lang ?? "auto"], { quiet: true });
  return JSON.parse(out.trim().split(/\r?\n/).at(-1));
}

const takes = readdirSync(p.takes).filter((f) => /^take\d+\.(mp4|webm|mov)$/.test(f)).sort();
if (!takes.length) throw new Error(`No takes in ${p.takes}. Record first.`);
for (const f of takes) {
  const take = f.match(/take(\d+)/)[1];
  const dest = join(p.transcripts, `take${take}.json`);
  if (existsSync(dest)) continue;
  const marksFile = join(p.takes, `take${take}.marks.json`);
  const marks = existsSync(marksFile) ? JSON.parse(readFileSync(marksFile, "utf8")) : { beats: [] };
  const wav = join(p.transcripts, `take${take}.wav`);
  ffmpeg(["-i", join(p.takes, f), "-vn", "-ac", "1", "-ar", "16000", wav]);
  try {
    const r = cfg.transcriber === "whisper" ? whisper(wav) : await scribe(wav);
    writeFileSync(dest, JSON.stringify({ file: join(p.takes, f), beat: marks.beats?.[0]?.beat ?? null, marks: marks.beats ?? [], seconds: marks.seconds ?? null, text: r.text, words: r.words }, null, 1));
    console.log(`take${take} (idea ${marks.beats?.[0]?.beat ?? "?"}): ${r.text}`);
  } finally {
    rmSync(wav, { force: true });
  }
}
