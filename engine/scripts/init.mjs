// Creates (or updates) a studio folder from the plugin's engine. Run by the
// plugin's setup, from the plugin itself:
//
//   node <plugin>/engine/scripts/init.mjs <studio folder> --language ar --transcriber elevenlabs --cutout apple
//   node <plugin>/engine/scripts/init.mjs <studio folder>      (update: keeps the earlier choices)
//
// Copies the template, writes saynema.config.json, and creates brand.json,
// .env and the example only when they don't exist yet, so running it again
// upgrades the template without touching the person's own files or videos.
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const engine = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(process.argv[2] ?? "saynema-studio");
const arg = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
// Running it again (an update) keeps the earlier choices unless a flag changes one.
const cfgFile = join(target, "saynema.config.json");
const legacy = join(target, "talkvideo.config.json"); // studios made before the rename
const old = existsSync(cfgFile) ? JSON.parse(readFileSync(cfgFile, "utf8")) : existsSync(legacy) ? JSON.parse(readFileSync(legacy, "utf8")) : {};
const language = arg("--language", old.language ?? "en");
const transcriber = arg("--transcriber", old.transcriber ?? "whisper");
const cutout = arg("--cutout", old.cutout ?? (process.platform === "darwin" ? "apple" : "mediapipe"));
if (!["elevenlabs", "whisper"].includes(transcriber)) throw new Error("--transcriber must be elevenlabs or whisper");
if (!["apple", "mediapipe"].includes(cutout)) throw new Error("--cutout must be apple or mediapipe");
if (cutout === "apple" && process.platform !== "darwin") throw new Error('"apple" cutout needs macOS; use --cutout mediapipe');

mkdirSync(target, { recursive: true });
// The template: code the plugin owns, replaced on every run.
for (const dir of ["src", "scripts", "recorder", "public/talk", "public/sfx"]) cpSync(join(engine, dir), join(target, dir), { recursive: true });
for (const file of ["package.json", "tsconfig.json", "remotion.config.ts"]) cpSync(join(engine, file), join(target, file));
mkdirSync(join(target, "public", "brand"), { recursive: true });
mkdirSync(join(target, "videos"), { recursive: true });

// The person's files: created once, never overwritten.
const once = (file, content) => existsSync(join(target, file)) || writeFileSync(join(target, file), content);
const rtl = ["ar", "fa", "ur", "he"].includes(language);
const brand = JSON.parse(readFileSync(join(engine, "brand.json"), "utf8"));
brand.direction = rtl ? "rtl" : "ltr";
brand.digits = language === "ar" ? "arabic" : "latin";
brand.font = rtl ? "Cairo" : "Inter";
once("brand.json", JSON.stringify(brand, null, 2) + "\n");
once(".env", "# Secrets for saynema. Never commit or share this file.\nELEVENLABS_API_KEY=\n");
once(".gitignore", "node_modules/\n.env\npublic/clips/\nvideos/*/takes/\nvideos/*/out/\nvideos/*/mask.mp4\nvideos/*/.parts/\n");
mkdirSync(join(target, "videos", "example"), { recursive: true });
once("videos/example/video.json", readFileSync(join(engine, "examples", language === "ar" ? "video.ar.json" : "video.en.json"), "utf8"));

// The plugin version this template came from, so doctor can tell when the
// plugin was updated but the studio still runs the old template.
const manifest = join(engine, "..", ".claude-plugin", "plugin.json");
const templateVersion = existsSync(manifest) ? JSON.parse(readFileSync(manifest, "utf8")).version : null;
const cfg = { ...old, language, transcriber, cutout, whisperModel: old.whisperModel ?? "large-v3-turbo", keyterms: old.keyterms ?? [], templateVersion };
writeFileSync(cfgFile, JSON.stringify(cfg, null, 2) + "\n");

// Remember where the studio is, so a new Claude session can find it.
writeFileSync(join(homedir(), ".saynema.json"), JSON.stringify({ studio: target }, null, 2) + "\n");
console.log(JSON.stringify({ studio: target, config: cfg, next: `cd "${target}" && npm install && node scripts/doctor.mjs` }));
