// Renders the finished video: videos/<id>/out/<id>.mp4 (1080×1920, 30 fps).
//
//   node scripts/render.mjs <id>
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { paths, studio } from "./config.mjs";
import { run } from "./run.mjs";

const id = process.argv[2];
const p = paths(id);
mkdirSync(p.out, { recursive: true });
const out = join(p.out, `${id}.mp4`);
run("npx", ["remotion", "render", "TalkVideo", out, `--props=${p.video}`, "--codec=h264", "--crf=18"], { cwd: studio });
console.log(`${out} is ready. Upload it natively to each platform.`);
