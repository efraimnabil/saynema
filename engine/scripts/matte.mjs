// Cuts the person out of the edited clip (for the head that pops out of the
// card) and finds where the head is after every cut (to frame the card).
//
//   node scripts/matte.mjs <id>
//
// Method from saynema.config.json "cutout":
//   "apple"      macOS Vision person segmentation (no download, best edges)
//   "mediapipe"  MediaPipe selfie segmenter, any OS (needs uv; downloads a 16 MB model once)
// Writes public/clips/<id>/cutout.webm (VP9 with alpha) and adds headTop/headX
// to every cut in public/clips/<id>/talk.json.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { cacheDir, config, paths, studio } from "./config.mjs";
import { ffmpeg, run, seconds } from "./run.mjs";

const id = process.argv[2];
const p = paths(id);
const cfg = config();
const talk = join(p.clip, "talk.mp4");
const talkJson = join(p.clip, "talk.json");
if (!existsSync(talk)) throw new Error(`No ${talk}. Run: npm run cut -- ${id}`);
const mask = join(p.dir, "mask.mp4");

const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite";
async function mediapipeModel() {
  mkdirSync(cacheDir, { recursive: true });
  const file = join(cacheDir, "selfie_multiclass_256x256.tflite");
  if (!existsSync(file)) {
    console.log("Downloading the MediaPipe person model (16 MB, once)…");
    const res = await fetch(MODEL_URL);
    if (!res.ok) throw new Error(`Model download failed: ${res.status}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return file;
}

const method = cfg.cutout ?? (process.platform === "darwin" ? "apple" : "mediapipe");
console.log(`Cutting out the person with ${method} (about ${Math.ceil(seconds(talk) / (method === "apple" ? 20 : 10))} min)…`);
if (method === "apple") {
  if (process.platform !== "darwin") throw new Error('"apple" cutout only runs on macOS. Set "cutout": "mediapipe" in saynema.config.json.');
  run("swift", [join(studio, "scripts", "matte-mac.swift"), talk, mask]);
} else {
  run("uv", ["run", "--quiet", join(studio, "scripts", "matte.py"), talk, mask, await mediapipeModel()]);
}

// The person on transparent: the clip's pixels, the mask as alpha. Both are
// read frame by frame from the start, so they stay in step.
ffmpeg(["-i", talk, "-i", mask, "-filter_complex", "[0:v]setpts=N/30/TB[v];[1:v]setpts=N/30/TB,format=gray[m];[v][m]alphamerge,format=yuva420p[o]",
  "-map", "[o]", "-an", "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "8M", "-deadline", "good", "-cpu-used", "4", "-row-mt", "1", join(p.clip, "cutout.webm")]);

// Where is the head after each cut? From one mask frame a little after the
// cut: the top of the head is the first row with enough person in it; its
// centre is the middle of the person in the band just under that.
const W = 1920, H = 1080;
function head(at) {
  const raw = execFileSync("ffmpeg", ["-v", "error", "-ss", String(at), "-i", mask, "-frames:v", "1", "-vf", `scale=${W}:${H},format=gray`, "-f", "rawvideo", "-"], { maxBuffer: W * H * 2 });
  let top = -1;
  for (let y = 0; y < H && top < 0; y++) {
    let n = 0;
    for (let x = 0; x < W; x++) if (raw[y * W + x] > 128) n++;
    if (n > W * 0.02) top = y;
  }
  if (top < 0) return null;
  let sx = 0, n = 0;
  for (let y = top; y < Math.min(H, top + 160); y++) for (let x = 0; x < W; x++) if (raw[y * W + x] > 128) { sx += x; n++; }
  return { headTop: top, headX: Math.round(sx / n) };
}
const data = JSON.parse(readFileSync(talkJson, "utf8"));
data.cuts.forEach((c, i) => {
  const next = data.cuts[i + 1]?.at ?? data.seconds;
  const h = head(Math.min(c.at + 0.3, (c.at + next) / 2));
  Object.assign(c, h ?? { headTop: 220, headX: 960 });
  if (!h) console.warn(`No person found after the cut at ${c.at}s; using the middle of the frame.`);
});
writeFileSync(talkJson, JSON.stringify(data, null, 1));
console.log(`${join(p.clip, "cutout.webm")} ready; head found at ${data.cuts.map((c) => `${c.headX},${c.headTop}`).join(" ")}. Next: write videos/${id}/video.json, then npm run stills -- ${id}`);
