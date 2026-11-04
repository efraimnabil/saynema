// The recording studio: a camera page with a prompter (one idea at a time,
// right under the camera), light and sound meters and a framing guide. Takes
// are saved to videos/<id>/takes/ with the idea marks.
//
//   node scripts/recorder.mjs <id> [--port 4310]
//
// Then open http://localhost:4310 in Chrome or Edge (the camera needs localhost).
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { arg, config, paths, studio } from "./config.mjs";

const id = process.argv[2];
const p = paths(id);
const port = Number(arg("--port", 4310));
const cfg = config();
mkdirSync(p.takes, { recursive: true });
if (!existsSync(p.beats)) throw new Error(`No ${p.beats}. Write the ideas first.`);

// Ideas come from the markdown table in beats.md: | # | idea | hint |
function beats() {
  return readFileSync(p.beats, "utf8")
    .split(/\r?\n/)
    .filter((l) => /^\|\s*\d+\s*\|/.test(l))
    .map((l) => {
      const c = l.split("|").slice(1, -1).map((s) => s.trim());
      return { n: Number(c[0]), idea: c[1] ?? "", hint: c[2] ?? "" };
    });
}

const takeFiles = () => readdirSync(p.takes).filter((f) => /^take\d+\.(mp4|webm)$/.test(f)).sort();
const nextTake = () => Math.max(0, ...takeFiles().map((f) => Number(f.match(/take(\d+)/)[1]))) + 1;

createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(readFileSync(join(studio, "recorder", "index.html")));
  }
  if (req.method === "GET" && url.pathname === "/beats") {
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify({ id, lang: cfg.language, beats: beats(), folder: p.takes, next: nextTake(), takes: takeFiles() }));
  }
  if (req.method === "POST" && url.pathname === "/save") {
    const ext = url.searchParams.get("ext") === "mp4" ? "mp4" : "webm";
    const take = Number(url.searchParams.get("take")) || nextTake();
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const name = `take${String(take).padStart(2, "0")}`;
      const body = Buffer.concat(chunks);
      writeFileSync(join(p.takes, `${name}.${ext}`), body);
      const marks = url.searchParams.get("marks");
      if (marks) writeFileSync(join(p.takes, `${name}.marks.json`), marks);
      console.log(`saved ${name}.${ext} (${(body.length / 1e6).toFixed(1)} MB)`);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ name: `${name}.${ext}`, next: take + 1 }));
    });
    return;
  }
  res.writeHead(404).end();
}).listen(port, "127.0.0.1", () => console.log(`Recorder for "${id}": open http://localhost:${port} in Chrome or Edge. Takes go to ${p.takes}`));
