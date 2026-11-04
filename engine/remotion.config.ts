import { Config } from "@remotion/cli/config";
import { browserExecutable } from "./scripts/browser.mjs";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// Remotion downloads its own headless Chrome. On some new macOS versions it
// crashes at start; an installed Google Chrome renders fine, so prefer it.
const chrome = browserExecutable();
if (chrome) {
  Config.setBrowserExecutable(chrome);
  Config.setChromeMode("chrome-for-testing");
}
