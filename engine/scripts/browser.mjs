// The browser Remotion renders with. Remotion's own headless Chrome is the
// default; on macOS an installed Google Chrome is used instead, because the
// downloaded shell crashes on some macOS versions ("icudtl.dat not found").
// Set TALK_VIDEO_CHROME to force a path, or to "bundled" to use Remotion's.
import { existsSync } from "node:fs";

export function browserExecutable() {
  const forced = process.env.TALK_VIDEO_CHROME;
  if (forced === "bundled") return null;
  if (forced) return forced;
  if (process.platform !== "darwin") return null;
  const mac = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  return existsSync(mac) ? mac : null;
}
