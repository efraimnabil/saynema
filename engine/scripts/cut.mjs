// Joins the chosen parts of the takes into one clip, cutting the pauses and
// fillers, and moves the word times onto the new timeline.
//
//   node scripts/cut.mjs <id>
//
// Reads videos/<id>/edit.json:
//   {"segments": [{"beat": 1, "take": "03", "parts": [[0.86, 5.26], [5.9, 8.1]]}, …]}
// (times are seconds inside that take; Claude writes this from the transcripts).
// Writes public/clips/<id>/talk.mp4 (1920×1080, 30 fps, voice levelled to
// −14 LUFS) and public/clips/<id>/talk.json ({seconds, cuts, words}).
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { paths } from "./config.mjs";
import { ffmpeg } from "./run.mjs";

const id = process.argv[2];
const p = paths(id);
const edit = JSON.parse(readFileSync(p.edit, "utf8"));
mkdirSync(p.clip, { recursive: true });
const tmp = join(p.dir, ".parts");
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

const FADE = 0.012; // tiny audio fades so cuts never click
// Any camera shape becomes 1920×1080: scale to cover, then centre-crop.
const VF = "fps=30,scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,format=yuv420p";
const list = [];
const words = [];
const cuts = [];
let t = 0;
let n = 0;
for (const seg of edit.segments) {
  const take = JSON.parse(readFileSync(join(p.transcripts, `take${seg.take}.json`), "utf8"));
  for (const [a, b] of seg.parts) {
    const d = +(b - a).toFixed(3);
    if (d <= 0.05) throw new Error(`Part [${a}, ${b}] of take ${seg.take} is empty.`);
    const part = join(tmp, `p${String(n++).padStart(3, "0")}.mov`);
    ffmpeg(["-ss", String(a), "-t", String(d), "-i", take.file, "-vf", VF,
      "-af", `aresample=48000,afade=t=in:d=${FADE},afade=t=out:st=${Math.max(0, d - FADE)}:d=${FADE}`,
      "-c:v", "libx264", "-crf", "12", "-preset", "fast", "-c:a", "pcm_s16le", part]);
    list.push(`file '${part.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`);
    cuts.push({ at: +t.toFixed(3), beat: seg.beat, take: seg.take, from: a });
    for (const w of take.words) if (w.k === "word" && w.s >= a - 0.02 && w.e <= b + 0.05) words.push({ t: w.t, s: +(t + w.s - a).toFixed(3), e: +(t + w.e - a).toFixed(3), beat: seg.beat });
    t += d;
  }
}
writeFileSync(join(tmp, "list.txt"), list.join("\n") + "\n");
const joined = join(tmp, "joined.mov");
ffmpeg(["-f", "concat", "-safe", "0", "-i", join(tmp, "list.txt"), "-c", "copy", joined]);
// Voice: cut rumble, gentle denoise, level to what platforms play at.
ffmpeg(["-i", joined, "-af", "highpass=f=80,afftdn=nf=-30,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000",
  "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", join(p.clip, "talk.mp4")]);
writeFileSync(join(p.clip, "talk.json"), JSON.stringify({ seconds: +t.toFixed(3), cuts, words }, null, 1));
rmSync(tmp, { recursive: true, force: true });
console.log(`${join(p.clip, "talk.mp4")}: ${t.toFixed(2)} s, ${cuts.length} parts, ${words.length} words. Next: npm run matte -- ${id}`);
