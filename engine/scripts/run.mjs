// Run a program and fail with a readable message. `which` finds a program on
// PATH on every OS (Windows looks for .exe/.cmd too).
import { execFileSync, spawnSync } from "node:child_process";

export function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: opts.quiet ? "pipe" : "inherit", shell: process.platform === "win32" && /^(npx|npm|uv)$/.test(cmd), ...opts });
  if (r.error) throw new Error(`Could not start ${cmd}: ${r.error.message}`);
  if (r.status !== 0) throw new Error(`${cmd} failed (exit ${r.status})${opts.quiet ? `:\n${r.stderr}` : ""}`);
  return r.stdout?.toString() ?? "";
}

export function ffmpeg(args) {
  return run("ffmpeg", ["-v", "error", "-y", ...args], { quiet: true });
}

export function seconds(file) {
  return Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim());
}

export function which(cmd) {
  const r = spawnSync(process.platform === "win32" ? "where" : "which", [cmd], { stdio: "pipe" });
  return r.status === 0 ? r.stdout.toString().split(/\r?\n/)[0].trim() : null;
}

export function version(cmd, args = ["--version"]) {
  const r = spawnSync(cmd, args, { stdio: "pipe", shell: process.platform === "win32" });
  return r.status === 0 ? (r.stdout.toString() || r.stderr.toString()).split(/\r?\n/)[0].trim() : null;
}
