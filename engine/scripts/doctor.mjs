// Checks everything the studio needs and says how to fix what's missing.
//
//   node scripts/doctor.mjs          a readable list
//   node scripts/doctor.mjs --json   the same, for Claude
//   --plugin <plugin folder>         also check the studio's template is that plugin's version
//
// It never prints secrets: for an API key it only says whether one is set.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { secret, studio } from "./config.mjs";
import { version, which } from "./run.mjs";

const os = process.platform === "darwin" ? "mac" : process.platform === "win32" ? "windows" : "linux";
const FIX = {
  node: { mac: "brew install node", windows: "winget install OpenJS.NodeJS.LTS", linux: "Install Node 20+ from https://nodejs.org or your package manager" },
  ffmpeg: { mac: "brew install ffmpeg", windows: "winget install Gyan.FFmpeg  (then open a new terminal)", linux: "sudo apt install ffmpeg  (or your distro's package)" },
  uv: { mac: "brew install uv", windows: "winget install astral-sh.uv  (then open a new terminal)", linux: "curl -LsSf https://astral.sh/uv/install.sh | sh" },
  swift: { mac: "xcode-select --install" },
};
const checks = [];
const check = (name, ok, detail, fix) => checks.push({ name, ok: !!ok, detail, fix: ok ? undefined : fix });

const [maj, min] = process.versions.node.split(".").map(Number);
check("Node.js 20.19+", maj > 20 || (maj === 20 && min >= 19), `v${process.versions.node}`, FIX.node[os]);

const ff = which("ffmpeg"), fp = which("ffprobe");
check("ffmpeg + ffprobe", ff && fp, ff ? version("ffmpeg", ["-version"]) : "not found", FIX.ffmpeg[os]);
if (ff) {
  const enc = spawnSync("ffmpeg", ["-hide_banner", "-encoders"], { stdio: "pipe" }).stdout?.toString() ?? "";
  check("ffmpeg can write VP9 with alpha (libvpx-vp9)", enc.includes("libvpx-vp9"), enc.includes("libvpx-vp9") ? "yes" : "this ffmpeg build has no libvpx", FIX.ffmpeg[os]);
}

check("Studio packages installed", existsSync(join(studio, "node_modules", "remotion")), studio, `cd "${studio}" && npm install`);

const cfgFile = join(studio, "saynema.config.json");
let cfg = null;
try { cfg = JSON.parse(readFileSync(cfgFile, "utf8")); } catch { /* reported below */ }
const pluginDir = process.argv.includes("--plugin") ? process.argv[process.argv.indexOf("--plugin") + 1] : null;
if (pluginDir && cfg) {
  let latest = null;
  try { latest = JSON.parse(readFileSync(join(pluginDir, ".claude-plugin", "plugin.json"), "utf8")).version; } catch { /* no manifest: skip */ }
  if (latest) check("Studio template up to date", cfg.templateVersion === latest, `studio ${cfg.templateVersion ?? "before 0.2.0"}, plugin ${latest}`, "Run /saynema:setup again: it updates the template and keeps your videos, brand and settings");
}
check("saynema.config.json", cfg, cfg ? `language ${cfg.language}, transcriber ${cfg.transcriber}, cutout ${cfg.cutout}` : "missing or not valid JSON", "Run the plugin's setup again");

if (cfg?.transcriber === "elevenlabs") {
  const key = secret("ELEVENLABS_API_KEY");
  check("ElevenLabs key in .env", key, key ? "set (not shown)" : "not set", `Open ${join(studio, ".env")} and paste your key after ELEVENLABS_API_KEY=  (from elevenlabs.io → Developers → API keys)`);
}
const needUv = cfg?.transcriber === "whisper" || cfg?.cutout === "mediapipe";
if (needUv) check("uv (runs the Python parts)", which("uv"), which("uv") ? version("uv") : "not found", FIX.uv[os]);
if (cfg?.cutout === "apple") {
  check("macOS for Apple cutout", os === "mac", os, 'Set "cutout": "mediapipe" in saynema.config.json');
  if (os === "mac") check("Swift (Xcode command line tools)", which("swift"), which("swift") ? version("swift", ["--version"]) : "not found", FIX.swift.mac);
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ os, studio, ok: checks.every((c) => c.ok), checks }, null, 1));
} else {
  for (const c of checks) console.log(`${c.ok ? "✓" : "✗"} ${c.name}: ${c.detail}${c.fix ? `\n    fix: ${c.fix}` : ""}`);
  console.log(checks.every((c) => c.ok) ? "\nAll good." : "\nFix the ✗ lines, then run this again.");
}
process.exitCode = checks.every((c) => c.ok) ? 0 : 1;
