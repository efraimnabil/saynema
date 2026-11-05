// Shared paths and settings for every script. Scripts run from the studio
// folder (where saynema.config.json is), on macOS, Windows or Linux.
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const studio = join(dirname(fileURLToPath(import.meta.url)), "..");
export const cacheDir = join(homedir(), ".cache", "saynema");

export function config() {
  const file = join(studio, "saynema.config.json");
  if (!existsSync(file)) throw new Error(`No saynema.config.json in ${studio}. Run the plugin's setup first.`);
  return JSON.parse(readFileSync(file, "utf8"));
}

/** A value from .env (never printed). */
export function secret(name) {
  if (process.env[name]) return process.env[name];
  const file = join(studio, ".env");
  if (!existsSync(file)) return null;
  const line = readFileSync(file, "utf8").split(/\r?\n/).find((l) => l.startsWith(`${name}=`));
  const v = line?.slice(name.length + 1).trim().replace(/^["']|["']$/g, "");
  return v || null;
}

/** videos/<id>/… and public/clips/<id>/… for one video. */
export function paths(id) {
  if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) throw new Error(`Give a video id made of letters, digits, - or _ (got "${id ?? ""}").`);
  const dir = join(studio, "videos", id);
  return {
    dir,
    beats: join(dir, "beats.md"),
    takes: join(dir, "takes"),
    transcripts: join(dir, "transcripts"),
    edit: join(dir, "edit.json"),
    video: join(dir, "video.json"),
    out: join(dir, "out"),
    clip: join(studio, "public", "clips", id),
    clipRel: `clips/${id}`,
  };
}

export const arg = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
