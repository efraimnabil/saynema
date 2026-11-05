import React from "react";
import { Img, staticFile } from "remotion";
import { BRAND, LOOK, alpha, appear, bigNum, clamp01, easeOut, glow, num } from "./look";

/**
 * One widget per sentence, drawn above the face. Rows are grey bars, not text:
 * the shape tells the story, and only tags and numbers are read. Each widget
 * gets its own frame `f`, the scene length `d` in frames, and `steps`: frames
 * (from the scene start) of spoken words it reacts to.
 *
 * Every word a widget shows comes from its props, so it works in any language.
 * The catalogue for Claude is skills/saynema/references/widgets.md; keep the
 * two in step.
 */
export type WidgetProps = { f: number; d: number; fps: number; steps: number[]; p: Record<string, unknown> };
type Tone = "accent" | "ok" | "bad" | "light" | "second";

const W = 780;
const str = (v: unknown, fb = "") => (v === undefined || v === null ? fb : String(v));
const s0 = (steps: number[], i: number, fb: number) => steps[i] ?? fb;
const toneColor = (t: Tone) => ({ accent: LOOK.accent, ok: LOOK.ok, bad: LOOK.bad, light: LOOK.text, second: LOOK.second })[t] ?? LOOK.accent;

// ---------- pieces ----------
export const Card: React.FC<{ f: number; at?: number; width?: number; header?: string; clock?: string; children: React.ReactNode; pad?: number }> = ({ f, at = 0, width = W, header, clock, children, pad = 28 }) => (
  <div style={{ width, background: `linear-gradient(180deg, ${LOOK.glass2}, ${LOOK.glass})`, border: `1.5px solid ${LOOK.line}`, borderRadius: 30, boxShadow: "0 30px 80px rgba(0,0,0,0.45)", padding: pad, ...appear(f, at, 10, 22) }}>
    {header ? (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 18, marginBottom: 20, borderBottom: `1.5px solid ${LOOK.line}` }}>
        <span style={{ color: LOOK.accent, fontSize: 30, fontWeight: 800, textShadow: glow(LOOK.accent, 14, 0.35) }}>{header}</span>
        {clock ? <span style={{ color: LOOK.dim, fontSize: 26, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{clock}</span> : null}
      </div>
    ) : null}
    {children}
  </div>
);

export const Pill: React.FC<{ children: React.ReactNode; tone?: Tone; size?: number; style?: React.CSSProperties }> = ({ children, tone = "accent", size = 28, style }) => {
  const c = toneColor(tone);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: c, color: LOOK.onAccent, fontSize: size, fontWeight: 800, padding: `${size * 0.22}px ${size * 0.7}px`, borderRadius: 999, boxShadow: glow(c, 26, 0.5), whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", ...style }}>
      {children}
    </span>
  );
};

const Bar: React.FC<{ w: number; h?: number; o?: number; c?: string }> = ({ w, h = 14, o = 1, c = LOOK.bar }) => <div style={{ width: w, height: h, borderRadius: h, background: c, opacity: o }} />;
const Dot: React.FC<{ c?: string; s?: number }> = ({ c = LOOK.accent, s = 46 }) => <div style={{ width: s, height: s, borderRadius: s, background: c, boxShadow: glow(c, 18, 0.35), flexShrink: 0 }} />;

/** A row: avatar dot, two grey bars, a tag at the end. */
const Row: React.FC<{ f: number; at: number; tag?: React.ReactNode; dot?: string; w1?: number; w2?: number }> = ({ f, at, tag, dot, w1 = 220, w2 = 320 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "14px 0", ...appear(f, at, 8, 14) }}>
    <Dot c={dot} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
      <Bar w={w1} h={15} o={0.9} />
      <Bar w={w2} h={11} o={0.45} />
    </div>
    {tag}
  </div>
);

export const Tile: React.FC<{ size?: number; children: React.ReactNode; lit?: number; style?: React.CSSProperties }> = ({ size = 170, children, lit = 0, style }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.26, background: `linear-gradient(180deg, ${LOOK.glass2}, ${LOOK.glass})`, border: `1.5px solid ${lit ? LOOK.accent : LOOK.line}`, boxShadow: lit ? `${glow(LOOK.accent, 40, 0.35 * lit)}, 0 24px 60px rgba(0,0,0,0.45)` : "0 24px 60px rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, ...style }}>
    {children}
  </div>
);

/** Line icons, drawn in the accent colour. Names are listed in widgets.md. */
export const ICONS = ["notebook", "money", "people", "person", "phone", "file", "sheet", "list", "chat", "clock", "calendar", "chart", "check", "mail", "lock", "rocket", "star", "home", "cart", "code", "bolt", "heart", "gear", "search", "video", "mic"] as const;
export const Icon: React.FC<{ name: string; s?: number; c?: string }> = ({ name, s = 84, c = LOOK.accent }) => {
  const p = { fill: "none", stroke: c, strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const g: Record<string, React.ReactNode> = {
    notebook: (<><rect x="6" y="3" width="13" height="18" rx="2" {...p} /><path d="M9 3v18M12 8h4M12 12h4M12 16h3" {...p} /></>),
    money: (<><rect x="3" y="6" width="18" height="12" rx="2" {...p} /><circle cx="12" cy="12" r="3" {...p} /><path d="M6 9v.01M18 15v.01" {...p} /></>),
    people: (<><circle cx="9" cy="8" r="3" {...p} /><path d="M3.5 20c.5-3.5 3-5.5 5.5-5.5s5 2 5.5 5.5" {...p} /><circle cx="17" cy="10" r="2.2" {...p} /><path d="M15.5 14.8c.5-.2 1-.3 1.5-.3 2 0 3.6 1.6 4 4.5" {...p} /></>),
    person: (<><circle cx="12" cy="8" r="4" {...p} /><path d="M4 21c.8-4.4 4-7 8-7s7.2 2.6 8 7" {...p} /></>),
    phone: (<><rect x="7" y="2.5" width="10" height="19" rx="2.5" {...p} /><path d="M11 18.5h2" {...p} /></>),
    file: (<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" {...p} /><path d="M14 3v5h5M9 13h6M9 17h4" {...p} /></>),
    sheet: (<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" {...p} /><path d="M14 3v5h5M8.5 12h7M8.5 15h7M8.5 18h7M12 11v8" {...p} /></>),
    list: (<><path d="M9 6h11M9 12h11M9 18h11" {...p} /><path d="M4 6h.01M4 12h.01M4 18h.01" {...p} strokeWidth={3.4} /></>),
    chat: (<><path d="M4 5h16v10H9l-5 4z" {...p} /><path d="M8 9h8M8 12h5" {...p} /></>),
    clock: (<><circle cx="12" cy="12" r="9" {...p} /><path d="M12 7v5l3 2" {...p} /></>),
    calendar: (<><rect x="3.5" y="5" width="17" height="15" rx="2" {...p} /><path d="M3.5 10h17M8 3v4M16 3v4" {...p} /></>),
    chart: (<><path d="M4 20V4M4 20h16" {...p} /><path d="M7 15l4-4 3 3 5-6" {...p} /></>),
    check: (<><circle cx="12" cy="12" r="9" {...p} /><path d="M7.5 12.5l3 3 6-6.5" {...p} /></>),
    mail: (<><rect x="3" y="5.5" width="18" height="13" rx="2" {...p} /><path d="M3.5 7l8.5 6 8.5-6" {...p} /></>),
    lock: (<><rect x="5" y="11" width="14" height="10" rx="2" {...p} /><path d="M8 11V8a4 4 0 0 1 8 0v3" {...p} /></>),
    rocket: (<><path d="M12 3c3.5 2 5 5.5 5 9l-2.5 3h-5L7 12c0-3.5 1.5-7 5-9z" {...p} /><circle cx="12" cy="9.5" r="1.6" {...p} /><path d="M9.5 15l-2 4 3-1.2M14.5 15l2 4-3-1.2" {...p} /></>),
    star: (<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" {...p} />),
    home: (<><path d="M4 11l8-7 8 7" {...p} /><path d="M6 9.5V20h12V9.5M10 20v-5h4v5" {...p} /></>),
    cart: (<><path d="M3 4h2.5l2 11h10.5l2-7.5H7" {...p} /><circle cx="9.5" cy="19" r="1.4" {...p} /><circle cx="17" cy="19" r="1.4" {...p} /></>),
    code: (<path d="M9 7l-5 5 5 5M15 7l5 5-5 5" {...p} />),
    bolt: (<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z" {...p} />),
    heart: (<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z" {...p} />),
    gear: (<><circle cx="12" cy="12" r="3" {...p} /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" {...p} /></>),
    search: (<><circle cx="10.5" cy="10.5" r="6" {...p} /><path d="M15 15l5.5 5.5" {...p} /></>),
    video: (<><rect x="3" y="6.5" width="12.5" height="11" rx="2" {...p} /><path d="M15.5 10.5l5-3v9l-5-3" {...p} /></>),
    mic: (<><rect x="9" y="3" width="6" height="11" rx="3" {...p} /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" {...p} /></>),
  };
  return <svg width={s} height={s} viewBox="0 0 24 24">{g[name] ?? g.star}</svg>;
};

/** The brand logo (brand.json "logo", a file in public/), or its first letter. */
export const Logo: React.FC<{ s?: number }> = ({ s = 120 }) =>
  BRAND.logo ? (
    <Img src={staticFile(BRAND.logo)} style={{ width: s, height: s, borderRadius: s * 0.24, objectFit: "cover" }} />
  ) : (
    <div style={{ width: s, height: s, borderRadius: s * 0.24, background: LOOK.accent, color: LOOK.onAccent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: s * 0.5, fontWeight: 900 }}>{BRAND.name.slice(0, 1)}</div>
  );

/** An icon name, or "logo" for the brand logo. */
const Mark: React.FC<{ name: string; s?: number; c?: string }> = ({ name, s = 84, c }) => (name === "logo" ? <Logo s={s * 1.33} /> : <Icon name={name} s={s} c={c} />);

/** A dashed link that fills in reading order. */
const Link: React.FC<{ k: number; w?: number }> = ({ k, w = 220 }) => (
  <div style={{ width: w, height: 4, position: "relative", direction: "ltr" }}>
    <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(90deg, ${LOOK.dim} 0 12px, transparent 12px 22px)`, opacity: 0.6 }} />
    <div style={{ position: "absolute", [BRAND.rtl ? "right" : "left"]: 0, top: 0, bottom: 0, width: `${k * 100}%`, backgroundImage: `repeating-linear-gradient(90deg, ${LOOK.accent} 0 12px, transparent 12px 22px)`, boxShadow: glow(LOOK.accent, 10, 0.5) }} />
  </div>
);

const Check: React.FC<{ k: number; s?: number; c?: string }> = ({ k, s = 44, c = LOOK.ok }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ opacity: k > 0 ? 1 : 0 }}>
    <circle cx="12" cy="12" r="11" fill={c} opacity={0.18 * k} />
    <path d="M6.5 12.5l3.5 3.5 7.5-8" fill="none" stroke={c} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={20} strokeDashoffset={20 * (1 - k)} />
  </svg>
);

const Center: React.FC<{ children: React.ReactNode; gap?: number; col?: boolean }> = ({ children, gap = 30, col }) => (
  <div style={{ display: "flex", flexDirection: col ? "column" : "row", alignItems: "center", justifyContent: "center", gap }}>{children}</div>
);

const Badge: React.FC<{ f: number; at: number; text: unknown; tone?: Tone; size?: number }> = ({ f, at, text, tone = "accent", size = 30 }) =>
  text ? <div style={appear(f, at)}><Pill size={size} tone={tone}>{str(text)}</Pill></div> : null;

/** A paper sheet with lines (the old way). */
const Paper: React.FC<{ w: number; h: number; rot: number; children?: React.ReactNode; lines?: number[] }> = ({ w, h, rot, children, lines = [260, 200, 280, 170, 240] }) => (
  <div style={{ width: w, height: h, background: "#EDE4D3", borderRadius: 18, padding: "34px 40px", boxShadow: "0 30px 80px rgba(0,0,0,0.5)", transform: `rotate(${rot}deg)`, display: "flex", flexDirection: "column", gap: 22 }}>
    {children ?? lines.map((lw, i) => <div key={i} style={{ width: lw, height: 10, borderRadius: 10, background: "#9C8F7A", opacity: 0.8 }} />)}
  </div>
);

// ---------- widgets ----------

/** The old way gets crossed out, then a badge. */
const Crossed: React.FC<WidgetProps> = ({ f, d, steps, p }) => {
  const cross = s0(steps, 0, d * 0.45);
  const k = easeOut((f - cross) / 12);
  return (
    <Center col gap={34}>
      <div style={{ position: "relative", ...appear(f, 0, 10) }}>
        {p.icon ? <Tile size={300}><Icon name={str(p.icon)} s={170} c={LOOK.dim} /></Tile> : <Paper w={380} h={300} rot={-3} />}
        <svg width={460} height={380} viewBox="0 0 460 380" style={{ position: "absolute", left: p.icon ? -80 : -40, top: -40 }}>
          <path d="M60 60 L400 320" stroke={LOOK.bad} strokeWidth={14} strokeLinecap="round" strokeDasharray={430} strokeDashoffset={430 * (1 - k)} />
          <path d="M400 60 L60 320" stroke={LOOK.bad} strokeWidth={14} strokeLinecap="round" strokeDasharray={430} strokeDashoffset={430 * (1 - easeOut((f - cross - 6) / 12))} />
        </svg>
      </div>
      <Badge f={f} at={cross + 10} text={p.badge} size={34} />
    </Center>
  );
};

/** Two tiles joined by a link that fills (old → new), then a badge. */
const Tiles: React.FC<WidgetProps> = ({ f, d, steps, p }) => {
  const link = easeOut((f - s0(steps, 0, 6)) / 16);
  const done = s0(steps, 1, d * 0.55);
  return (
    <Center col gap={40}>
      <Center gap={26}>
        <div style={appear(f, 0)}><Tile><Mark name={str(p.from, "notebook")} /></Tile></div>
        <Link k={link} />
        <div style={appear(f, 4)}><Tile lit={link}><Mark name={str(p.to, "logo")} /></Tile></div>
      </Center>
      <Badge f={f} at={done} text={p.badge} size={32} />
    </Center>
  );
};

/** A name card: logo, name, role. */
const NameTag: React.FC<WidgetProps> = ({ f, p }) => (
  <Card f={f} width={700} pad={34}>
    <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
      <Logo s={130} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
        <div style={{ color: LOOK.text, fontSize: 52, fontWeight: 800, ...appear(f, 6) }}>{str(p.name)}</div>
        <Badge f={f} at={14} text={p.role} />
      </div>
    </div>
  </Card>
);

/** Cards fanning out, each with a label and a count. */
const Cards: React.FC<WidgetProps> = ({ f, p }) => {
  const labels = (p.labels as string[]) ?? [];
  const counts = (p.counts as (number | string)[]) ?? [];
  const mid = (labels.length - 1) / 2;
  return (
    <div style={{ position: "relative", width: W, height: 380 }}>
      {labels.map((l, i) => {
        const k = easeOut((f - 4 - i * 6) / 14);
        return (
          <div key={l} style={{ position: "absolute", left: W / 2 - 130 + (i - mid) * 240 * k, top: 30 + Math.abs(i - mid) * 24 * k, width: 260, transform: `rotate(${(i - mid) * 7 * k}deg)`, opacity: clamp01((f - i * 6) / 8) }}>
            <Card f={f} width={260} pad={24}>
              <div style={{ color: LOOK.accent, fontSize: 30, fontWeight: 800, marginBottom: 18 }}>{l}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}><Bar w={170} /><Bar w={130} o={0.5} /><Bar w={150} o={0.5} /></div>
              {counts[i] !== undefined ? <div style={{ marginTop: 20 }}><Pill size={24} tone="light">{num(String(counts[i]))} {str(p.unit)}</Pill></div> : null}
            </Card>
          </div>
        );
      })}
    </div>
  );
};

/** A big character (default "?") in a bracket frame. */
const Question: React.FC<WidgetProps> = ({ f, p }) => {
  const k = easeOut(f / 12);
  const br = (rot: number, pos: React.CSSProperties) => <div style={{ position: "absolute", width: 60, height: 60, borderTop: `6px solid ${LOOK.accent}`, borderLeft: `6px solid ${LOOK.accent}`, transform: `rotate(${rot}deg)`, boxShadow: glow(LOOK.accent, 12, 0.4), ...pos }} />;
  return (
    <div style={{ position: "relative", width: 420, height: 320, opacity: k }}>
      {br(0, { left: 0, top: 0 })}{br(90, { right: 0, top: 0 })}{br(180, { right: 0, bottom: 0 })}{br(270, { left: 0, bottom: 0 })}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: LOOK.accent, fontSize: 210, fontWeight: 900, textShadow: glow(LOOK.accent, 40, 0.6) }}>{str(p.text, BRAND.rtl ? "؟" : "?")}</div>
    </div>
  );
};

/** The pain: a paper list with ✓ and ✗, then a circled mess. */
const Messy: React.FC<WidgetProps> = ({ f, d }) => (
  <div style={{ position: "relative", ...appear(f, 0) }}>
    <Paper w={560} h={390} rot={2}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 200 + ((i * 53) % 120), height: 10, borderRadius: 10, background: "#9C8F7A" }} />
          <div style={{ fontSize: 34, color: i % 3 === 1 ? LOOK.bad : "#5E5446", fontWeight: 800, opacity: clamp01((f - 6 - i * 5) / 6) }}>{i % 3 === 1 ? "✗" : "✓"}</div>
          {i === 2 ? <div style={{ fontSize: 30, color: LOOK.bad, fontWeight: 800, opacity: clamp01((f - d * 0.5) / 6) }}>??</div> : null}
        </div>
      ))}
    </Paper>
    <svg width={600} height={430} viewBox="0 0 600 430" style={{ position: "absolute", left: -20, top: -20 }}>
      <ellipse cx="330" cy="190" rx="120" ry="40" fill="none" stroke={LOOK.bad} strokeWidth={6} strokeDasharray={520} strokeDashoffset={520 * (1 - easeOut((f - d * 0.45) / 14))} transform="rotate(-8 330 190)" />
    </svg>
  </div>
);

/** Rows ticking ✓ one by one; one can be marked off; a running count. */
const Checks: React.FC<WidgetProps> = ({ f, d, p }) => {
  const n = 5;
  const total = Number(p.total ?? 0);
  const offAt = p.off ? 3 : -1;
  const per = Math.max(5, (d * 0.6) / n);
  const ticked = Math.min(n, Math.max(0, Math.floor((f - 10) / per) + 1));
  const count = Math.round(total * easeOut((f - 10) / (per * n)));
  return (
    <Card f={f} header={str(p.header)} clock={total ? `${num(count)} / ${num(total)}` : undefined}>
      {[...Array(n)].map((_, i) => {
        const k = easeOut((f - 10 - i * per) / 6);
        const off = i === offAt;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, padding: "11px 0" }}>
            <Dot c={off ? LOOK.dim : LOOK.accent} s={40} />
            <div style={{ flex: 1 }}><Bar w={200 + ((i * 41) % 140)} /></div>
            {off ? <span style={{ opacity: k }}><Pill size={24} tone="bad">{str(p.off)}</Pill></span> : <Check k={i < ticked ? k : 0} />}
          </div>
        );
      })}
    </Card>
  );
};

/** A number that counts up, with a filling bar. */
const Counter: React.FC<WidgetProps> = ({ f, d, p }) => {
  const to = Number(p.to ?? 0);
  const k = easeOut((f - 6) / Math.max(20, d * 0.6));
  return (
    <Card f={f} header={str(p.header)} width={700}>
      <div style={{ textAlign: "center", color: LOOK.text, fontSize: 150, fontWeight: 900, lineHeight: 1.1, fontVariantNumeric: "tabular-nums", textShadow: glow("#ffffff", 30, 0.25) }}>
        {bigNum(to * k)}
        <span style={{ fontSize: 60, color: LOOK.accent, marginInlineStart: 16 }}>{str(p.unit)}</span>
      </div>
      <div style={{ height: 14, borderRadius: 14, background: LOOK.line, marginTop: 24, overflow: "hidden", direction: BRAND.dir }}>
        <div style={{ width: `${k * 100}%`, height: "100%", background: LOOK.accent, boxShadow: glow(LOOK.accent, 14, 0.6) }} />
      </div>
      <div style={{ textAlign: "center", marginTop: 26, opacity: clamp01((k - 0.95) * 20) }}>{p.badge ? <Pill size={28} tone="ok">{str(p.badge)}</Pill> : null}</div>
    </Card>
  );
};

/** One big figure with a label above and a badge below (a price, a date…). */
const Big: React.FC<WidgetProps> = ({ f, d, p }) => (
  <Card f={f} width={640} pad={36}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      {p.label ? <span style={{ color: LOOK.dim, fontSize: 34, fontWeight: 800 }}>{str(p.label)}</span> : null}
      <span style={{ color: LOOK.text, fontSize: 150, fontWeight: 900, lineHeight: 1.05, textShadow: glow("#ffffff", 30, 0.25) }}>
        {num(str(p.big))}
        <span style={{ fontSize: 58, color: LOOK.accent, marginInlineStart: 14 }}>{str(p.unit)}</span>
      </span>
      <Badge f={f} at={d * 0.4} text={p.badge} tone="ok" size={32} />
    </div>
  </Card>
);

/** Rows with tags (paid / owes, done / late), appearing in turn. */
const Tags: React.FC<WidgetProps> = ({ f, d, p }) => {
  const rows = (p.rows as { tag: string; tone?: Tone }[]) ?? [];
  const per = Math.max(6, (d * 0.55) / Math.max(1, rows.length));
  return (
    <Card f={f} header={str(p.header)} clock={p.clock ? str(p.clock) : undefined}>
      {rows.map((r, i) => <Row key={i} f={f} at={8 + i * per} dot={r.tone === "bad" ? LOOK.bad : LOOK.accent} tag={<Pill size={26} tone={r.tone ?? "accent"}>{r.tag}</Pill>} w1={170 + ((i * 37) % 90)} w2={240 + ((i * 59) % 100)} />)}
    </Card>
  );
};

/** A phone whose tabs light up as each is named, and who sees it. */
const Phone: React.FC<WidgetProps> = ({ f, steps, p }) => {
  const tabs = (p.tabs as string[]) ?? [];
  const lit = tabs.map((_, i) => easeOut((f - s0(steps, i, 1e9)) / 8));
  return (
    <Center gap={34}>
      <div style={appear(f, 0)}>
        <div style={{ width: 330, height: 470, borderRadius: 46, border: `3px solid ${LOOK.line}`, background: LOOK.glass, padding: 22, boxShadow: "0 30px 80px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ alignSelf: "center", width: 90, height: 10, borderRadius: 10, background: LOOK.line, marginBottom: 6 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}><Dot s={52} /><div style={{ display: "flex", flexDirection: "column", gap: 8 }}><Bar w={150} /><Bar w={100} o={0.5} h={10} /></div></div>
          {tabs.map((t, i) => (
            <div key={t} style={{ borderRadius: 18, padding: "14px 18px", background: lit[i] ? alpha(LOOK.accent, 0.14 * lit[i]) : LOOK.glass2, border: `1.5px solid ${lit[i] > 0.5 ? LOOK.accent : LOOK.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: lit[i] > 0.5 ? LOOK.accent : LOOK.text, fontSize: 30, fontWeight: 800 }}>{t}</span>
              <Check k={lit[i]} s={36} c={LOOK.accent} />
            </div>
          ))}
        </div>
      </div>
      {p.who ? (
        <div style={{ ...appear(f, 6), display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <Tile size={150}><Icon name={str(p.icon, "people")} s={80} /></Tile>
          <Pill size={28} tone="light">{str(p.who)}</Pill>
        </div>
      ) : null}
    </Center>
  );
};

/** A line rising point by point, left to right. Points are 0–100. */
const Chart: React.FC<WidgetProps> = ({ f, d, p }) => {
  const pts = (p.points as number[]) ?? [20, 32, 30, 48, 62, 85];
  const w = 660, h = 300;
  const k = easeOut((f - 6) / Math.max(20, d * 0.7));
  const xy = pts.map((v, i) => [(i / Math.max(1, pts.length - 1)) * w, h - (Math.max(0, Math.min(100, v)) / 100) * h] as const);
  const path = xy.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  return (
    <Card f={f} header={str(p.header)}>
      <svg width={w} height={h + 20} viewBox={`-10 -10 ${w + 20} ${h + 30}`} style={{ direction: "ltr" }}>
        {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke={LOOK.line} strokeWidth={2} />)}
        <path d={path} fill="none" stroke={LOOK.accent} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={2000} strokeDashoffset={2000 * (1 - k)} style={{ filter: `drop-shadow(0 0 10px ${alpha(LOOK.accent, 0.55)})` }} />
        {xy.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={12} fill={LOOK.accent} opacity={clamp01((k * (pts.length - 1) - i + 0.6) * 3)} />)}
      </svg>
      <div style={{ textAlign: "center", marginTop: 12 }}><Badge f={f} at={d * 0.75} text={p.badge} tone="ok" size={28} /></div>
    </Card>
  );
};

/** Avatars popping in, then a badge. */
const People: React.FC<WidgetProps> = ({ f, d, p }) => {
  const n = Math.max(1, Math.min(6, Number(p.count ?? 5)));
  return (
    <Center col gap={40}>
      <Center gap={22}>
        {[...Array(n)].map((_, i) => (
          <div key={i} style={appear(f, 4 + i * 5, 9, 26)}>
            <Tile size={120} lit={1}><svg width={64} height={64} viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill={LOOK.accent} /><path d="M4 21c.8-4.4 4-7 8-7s7.2 2.6 8 7" fill={LOOK.accent} /></svg></Tile>
          </div>
        ))}
      </Center>
      <Badge f={f} at={d * 0.45} text={p.badge} size={32} />
    </Center>
  );
};

/** Labelled boxes ticking ✓ in turn (days of a week, steps of a process). */
const Steps: React.FC<WidgetProps> = ({ f, d, p }) => {
  const labels = (p.labels as string[]) ?? ["1", "2", "3", "4", "5"];
  const per = Math.max(4, (d * 0.6) / labels.length);
  const box = Math.min(110, 640 / labels.length - 10);
  return (
    <Card f={f} header={str(p.header)} width={800}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {labels.map((x, i) => {
          const k = easeOut((f - 8 - i * per) / 6);
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{ width: box, height: box, borderRadius: 22, border: `2px solid ${k > 0.5 ? LOOK.accent : LOOK.line}`, background: alpha(LOOK.accent, 0.16 * k), display: "flex", alignItems: "center", justifyContent: "center", boxShadow: k > 0.5 ? glow(LOOK.accent, 20, 0.35) : "none" }}>
                <Check k={k} s={box * 0.6} c={LOOK.accent} />
              </div>
              <span style={{ color: LOOK.dim, fontSize: 26, fontWeight: 800 }}>{num(x)}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

/** A file turning into a clean list. */
const FileToList: React.FC<WidgetProps> = ({ f, d, p }) => {
  const link = easeOut((f - d * 0.25) / 18);
  return (
    <Center gap={28}>
      <div style={{ ...appear(f, 0), display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <Tile size={180}><Icon name={str(p.icon, "sheet")} s={100} c={LOOK.ok} /></Tile>
        {p.file ? <Pill size={24} tone="light">{str(p.file)}</Pill> : null}
      </div>
      <Link k={link} w={150} />
      <div style={appear(f, d * 0.3)}>
        <Card f={f} at={d * 0.3} width={360} pad={22} header={str(p.header)}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 0", ...appear(f, d * 0.35 + i * 6, 7, 10) }}>
              <Dot s={32} /><Bar w={150 + ((i * 31) % 60)} h={12} />
            </div>
          ))}
        </Card>
      </div>
    </Center>
  );
};

/** A chat: a question, two answers, then a badge. */
const Chat: React.FC<WidgetProps> = ({ f, d, p }) => {
  const bubble = (at: number, mine: boolean, w: number) => (
    <div style={{ alignSelf: mine ? "flex-start" : "flex-end", ...appear(f, at, 8, 12) }}>
      <div style={{ background: mine ? alpha(LOOK.accent, 0.16) : LOOK.glass2, border: `1.5px solid ${mine ? alpha(LOOK.accent, 0.5) : LOOK.line}`, borderRadius: 22, padding: "18px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
        <Bar w={w} c={mine ? LOOK.accent : LOOK.bar} o={mine ? 0.8 : 1} />
        <Bar w={w * 0.65} h={10} o={0.5} />
      </div>
    </div>
  );
  return (
    <Card f={f} header={str(p.header)} width={760}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {bubble(6, false, 260)}
        {bubble(d * 0.25, true, 320)}
        {bubble(d * 0.45, true, 220)}
      </div>
      <div style={{ textAlign: "center", marginTop: 22 }}><Badge f={f} at={d * 0.65} text={p.badge} tone="ok" size={28} /></div>
    </Card>
  );
};

/** A button a cursor clicks; it turns into the done text. */
const Button: React.FC<WidgetProps> = ({ f, d, steps, p }) => {
  const click = s0(steps, 0, d * 0.55);
  const move = easeOut((f - (click - 16)) / 16);
  const done = f >= click;
  const r = clamp01((f - click) / 14);
  return (
    <div style={{ position: "relative", width: 640, height: 300, display: "flex", alignItems: "center", justifyContent: "center", ...appear(f, 0) }}>
      <div style={{ padding: "30px 56px", borderRadius: 999, border: `3px solid ${LOOK.accent}`, background: done ? LOOK.accent : alpha(LOOK.accent, 0.08), color: done ? LOOK.onAccent : LOOK.accent, fontSize: 48, fontWeight: 900, boxShadow: glow(LOOK.accent, done ? 60 : 30, done ? 0.6 : 0.35), display: "flex", alignItems: "center", gap: 18, transform: `scale(${done ? 1 : 1 - 0.04 * clamp01((f - click + 3) / 3)})` }}>
        <Icon name={str(p.icon, "chat")} s={58} c={done ? LOOK.onAccent : LOOK.accent} />
        {done ? str(p.done, "✓") : str(p.label)}
      </div>
      <div style={{ position: "absolute", left: 260, top: 90, width: 120, height: 120, borderRadius: 120, border: `4px solid ${LOOK.accent}`, opacity: done ? (1 - r) * 0.8 : 0, transform: `scale(${0.6 + r * 1.4})` }} />
      <svg width={70} height={70} viewBox="0 0 24 24" style={{ position: "absolute", left: 330 + (1 - move) * 180, top: 160 + (1 - move) * 120 }}>
        <path d="M5 3l14 8-6 1.5L10 19z" fill="#fff" stroke="#16131A" strokeWidth={1.2} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/** One short line, big, with an optional small line under it. */
const Quote: React.FC<WidgetProps> = ({ f, p }) => (
  <Card f={f} width={800} pad={44}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, textAlign: "center" }}>
      <div style={{ color: LOOK.accent, fontSize: 120, lineHeight: 0.6, fontWeight: 900, height: 50 }}>“</div>
      <div style={{ color: LOOK.text, fontSize: 56, fontWeight: 800, lineHeight: 1.3, textWrap: "balance", ...appear(f, 6) }}>{str(p.text)}</div>
      {p.by ? <div style={{ color: LOOK.dim, fontSize: 30, fontWeight: 700, ...appear(f, 14) }}>{str(p.by)}</div> : null}
    </div>
  </Card>
);

/** A row of icons that light up one after another (features, a process). */
const Icons: React.FC<WidgetProps> = ({ f, d, steps, p }) => {
  const names = ((p.icons as string[]) ?? ["clock", "money", "people"]).slice(0, 4);
  const labels = (p.labels as string[]) ?? [];
  const per = (d * 0.6) / names.length;
  return (
    <Center col gap={36}>
      <Center gap={24}>
        {names.map((n, i) => {
          const at = s0(steps, i, 6 + i * per);
          const k = easeOut((f - at) / 10);
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, opacity: 0.35 + 0.65 * k }}>
              <Tile size={160} lit={k}><Mark name={n} s={84} /></Tile>
              {labels[i] ? <span style={{ color: k > 0.5 ? LOOK.text : LOOK.dim, fontSize: 28, fontWeight: 800 }}>{labels[i]}</span> : null}
            </div>
          );
        })}
      </Center>
      <Badge f={f} at={d * 0.75} text={p.badge} size={30} />
    </Center>
  );
};

/** The brand logo, big, with a badge (the sign-off). */
const LogoCard: React.FC<WidgetProps> = ({ f, d, p }) => (
  <Center col gap={34}>
    <div style={{ ...appear(f, 0, 12, 24), filter: `drop-shadow(0 0 40px ${alpha(LOOK.accent, 0.35)})` }}><Logo s={220} /></div>
    {p.title ? <div style={{ color: LOOK.text, fontSize: 64, fontWeight: 900, ...appear(f, 8) }}>{str(p.title)}</div> : null}
    <Badge f={f} at={d * 0.35} text={p.badge} size={32} />
  </Center>
);

export const WIDGETS: Record<string, React.FC<WidgetProps>> = {
  crossed: Crossed,
  tiles: Tiles,
  nametag: NameTag,
  cards: Cards,
  question: Question,
  messy: Messy,
  checks: Checks,
  counter: Counter,
  big: Big,
  tags: Tags,
  phone: Phone,
  chart: Chart,
  people: People,
  steps: Steps,
  file: FileToList,
  chat: Chat,
  button: Button,
  quote: Quote,
  icons: Icons,
  logo: LogoCard,
};
