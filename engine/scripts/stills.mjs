// One still per scene, from the middle of it, to check the video before the
// full render: videos/<id>/out/stills/scene01.png …
//
//   node scripts/stills.mjs <id> [--at 0.5]   (0.5 = middle of each scene)
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { arg, paths, studio } from "./config.mjs";
import { browserExecutable } from "./browser.mjs";

const id = process.argv[2];
const p = paths(id);
const at = Number(arg("--at", 0.5));
const props = JSON.parse(readFileSync(p.video, "utf8"));
const dir = join(p.out, "stills");
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });

const serveUrl = await bundle({ entryPoint: join(studio, "src", "index.ts") });
const browser = browserExecutable();
const opts = { serveUrl, inputProps: props, browserExecutable: browser, chromeMode: browser ? "chrome-for-testing" : undefined };
const composition = await selectComposition({ ...opts, id: "TalkVideo" });
const ends = props.scenes.map((_, i) => props.scenes[i + 1]?.from ?? composition.durationInFrames / 30);
for (const [i, s] of props.scenes.entries()) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round((s.from + (ends[i] - s.from) * at) * 30));
  const output = join(dir, `scene${String(i + 1).padStart(2, "0")}.png`);
  await renderStill({ ...opts, composition, frame, output, scale: 0.5 });
  console.log(`${output}  (${(frame / 30).toFixed(1)} s) ${s.caption.join(" ")}`);
}
