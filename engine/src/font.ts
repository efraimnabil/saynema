import { continueRender, delayRender } from "remotion";
import { getAvailableFonts } from "@remotion/google-fonts";
import { BRAND } from "./look";

/**
 * Loads the brand font (any Google Font, by its family name) before the first
 * frame renders. Only the weights and scripts the font actually has are
 * requested, so a Latin-only font never fails on "arabic".
 */
export const fontFamily = `"${BRAND.font}", system-ui, sans-serif`;

const WANT_WEIGHTS = ["600", "700", "800", "900"];
const WANT_SUBSETS = ["arabic", "latin", "latin-ext"];

const handle = delayRender(`font ${BRAND.font}`);
const font = getAvailableFonts().find((f) => f.fontFamily === BRAND.font);
if (!font) {
  console.warn(`brand.json font "${BRAND.font}" is not a Google Font; using the system font.`);
  continueRender(handle);
} else {
  font
    .load()
    .then((mod) => {
      const info = mod.getInfo();
      const weights = Object.keys(info.fonts.normal ?? {});
      const subsets = info.subsets as string[];
      const w = WANT_WEIGHTS.filter((x) => weights.includes(x));
      const s = WANT_SUBSETS.filter((x) => subsets.includes(x));
      const { waitUntilDone } = mod.loadFont("normal", { weights: (w.length ? w : weights) as never, subsets: (s.length ? s : subsets) as never });
      return waitUntilDone();
    })
    .catch((e: unknown) => console.warn("font failed to load", e))
    .finally(() => continueRender(handle));
}
