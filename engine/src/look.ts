import brand from "../brand.json";

/**
 * The look comes from brand.json at the studio root: a dark stage, one accent
 * colour, the person's face in a card their head breaks out of. Change the
 * colours, font and direction there, never here.
 */
const c = brand.colors;
export const LOOK = {
  bg: c.bg,
  glass: c.card,
  glass2: c.card2,
  line: c.line,
  bar: c.bar,
  text: c.text,
  dim: c.dim,
  accent: c.accent,
  onAccent: c.onAccent,
  second: c.second,
  ok: c.ok,
  bad: c.bad,
} as const;

export const BRAND = {
  name: brand.name,
  font: brand.font,
  rtl: brand.direction === "rtl",
  dir: (brand.direction === "rtl" ? "rtl" : "ltr") as "rtl" | "ltr",
  arabicDigits: brand.digits === "arabic",
  logo: (brand.logo as string | null) ?? null,
  particles: brand.particles !== false,
  grain: brand.grain !== false,
};

/** A hex colour with an alpha: alpha("#F3C170", 0.2) → rgba(243,193,112,0.2). */
export const alpha = (hex: string, a: number) => {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return hex;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${a})`;
};

export const glow = (col: string, r = 22, a = 0.45) => `0 0 ${r}px ${alpha(col, a)}`;

/** Digits in the brand's style: Arabic-Indic (٠١٢) or Latin (012). */
export const num = (s: string | number) => (BRAND.arabicDigits ? String(s).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]) : String(s));

/** Thousands with a separator: 4800 → ٤٬٨٠٠ or 4,800. */
export const bigNum = (n: number) => num(Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, BRAND.arabicDigits ? "٬" : ","));

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const ease = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);

/** Fade + short rise, no overshoot: text never bounces, blurs or shakes. */
export const appear = (f: number, at: number, dur = 9, rise = 18) => {
  const k = easeOut((f - at) / dur);
  return { opacity: k, transform: `translateY(${(1 - k) * rise}px)` };
};
