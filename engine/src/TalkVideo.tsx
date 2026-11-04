import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, CalculateMetadataFunction, OffthreadVideo, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { BRAND, LOOK, alpha, appear, clamp01, ease, glow } from "./look";
import { fontFamily } from "./font";
import { WIDGETS } from "./widgets";

/**
 * A talk video: the person talks to their camera, and a widget explains each
 * sentence above their face. Their head breaks out of the face card.
 *
 * Inputs (made by the scripts, see SKILL.md):
 *   public/clips/<id>/talk.mp4     the edited clip (scripts/cut.mjs)
 *   public/clips/<id>/talk.json    word times, cuts and head positions
 *   public/clips/<id>/cutout.webm  the person on a transparent background (scripts/matte.mjs)
 *   videos/<id>/video.json         scenes: caption, widget and face state per sentence
 *
 * With no clip, the scenes play over silence with the face hidden: a widget demo.
 */
const faceKind = z.enum(["card", "bleed", "hidden"]);
const cutSchema = z.object({ at: z.number(), headTop: z.number().default(220), headX: z.number().default(960) }).loose();
export const talkVideoSchema = z.object({
  clip: z.string().nullable().default(null),
  seconds: z.number().optional(),
  scenes: z.array(
    z.object({
      from: z.number(),
      caption: z.array(z.string()).min(1).max(2),
      accent: z.array(z.string()).default([]),
      face: faceKind.default("card"),
      widget: z.object({ kind: z.string(), steps: z.array(z.number()).default([]) }).catchall(z.unknown()),
    }),
  ),
  tail: z.number().default(0.6),
  sfx: z.boolean().default(true),
  talk: z.object({ seconds: z.number(), cuts: z.array(cutSchema) }).loose().optional(),
});
type Props = z.infer<typeof talkVideoSchema>;
type Face = z.infer<typeof faceKind>;
type Cut = z.infer<typeof cutSchema>;

export const calculateTalkVideo: CalculateMetadataFunction<Props> = async ({ props }) => {
  let talk = props.talk;
  if (props.clip) {
    const res = await fetch(staticFile(`${props.clip}/talk.json`));
    if (!res.ok) throw new Error(`No ${props.clip}/talk.json in public/. Run: npm run cut -- <id>`);
    talk = await res.json();
  }
  const seconds = talk?.seconds ?? props.seconds ?? (props.scenes.at(-1)?.from ?? 0) + 3;
  return { durationInFrames: Math.ceil((seconds + props.tail) * 30), props: { ...props, talk: talk ?? { seconds, cuts: [{ at: 0, headTop: 220, headX: 960 }] } } };
};

// ---------- layout (1080×1920 out, 1920×1080 camera) ----------
const SRC = { w: 1920, h: 1080 };
type Rect = { x: number; y: number; w: number; h: number };
const CARD: Rect = { x: 140, y: 1090, w: 800, h: 600 };
const BLEED: Rect = { x: 0, y: 1000, w: 1080, h: 920 };
const POP = 112; // how far the head rises above the card edge

/** Which part of the camera frame each face state shows. */
function crop(face: Face, headTop: number, headX: number, punch: number): Rect {
  if (face === "bleed") {
    const w = 1000 * punch, h = (w * BLEED.h) / BLEED.w;
    const s = BLEED.w / w;
    return { x: Math.max(0, Math.min(SRC.w - w, headX - w / 2)), y: Math.max(0, Math.min(SRC.h - h, headTop - 150 / s)), w, h };
  }
  const w = 960 * punch, h = w * 0.75;
  const s = CARD.w / w;
  return { x: Math.max(0, Math.min(SRC.w - w, headX - w / 2)), y: Math.max(0, Math.min(SRC.h - h, headTop + POP / s)), w, h };
}
/** Index of the last item that has started by time t. */
const lastStarted = <T,>(xs: T[], at: (x: T) => number, t: number) => {
  let i = 0;
  xs.forEach((x, j) => {
    if (at(x) <= t + 1e-6) i = j;
  });
  return i;
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpRect = (a: Rect, b: Rect, k: number): Rect => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), w: lerp(a.w, b.w, k), h: lerp(a.h, b.h, k) });

// Warm, a little less saturated, so the room sits on the dark stage.
const GRADE = "saturate(0.82) sepia(0.14) contrast(1.06) brightness(0.94)";

const FaceLayer: React.FC<{ clip: string; scenes: Props["scenes"]; cuts: Cut[] }> = ({ clip, scenes, cuts }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const si = lastStarted(scenes, (s) => s.from, t);
  const ci = lastStarted(cuts, (c) => c.at, t);
  const cut = cuts[ci];
  const punch = ci % 2 ? 0.9 : 1; // a punch-in on every other cut hides the jump
  const cur = scenes[si].face;
  const prev = si > 0 ? scenes[si - 1].face : cur;
  const k = ease((f - scenes[si].from * fps) / 12);
  const stateRect = (face: Face): { dst: Rect; src: Rect; r: number; o: number } => {
    if (face === "bleed") return { dst: BLEED, src: crop("bleed", cut.headTop, cut.headX, punch), r: 0, o: 1 };
    if (face === "hidden") return { dst: { ...CARD, y: CARD.y + 60 }, src: crop("card", cut.headTop, cut.headX, punch), r: 44, o: 0 };
    return { dst: CARD, src: crop("card", cut.headTop, cut.headX, punch), r: 44, o: 1 };
  };
  const a = stateRect(prev), b = stateRect(cur);
  const dst = lerpRect(a.dst, b.dst, k), src = lerpRect(a.src, b.src, k);
  const r = lerp(a.r, b.r, k), o = lerp(a.o, b.o, k);
  const cardness = lerp(prev === "card" ? 1 : 0, cur === "card" ? 1 : 0, k);
  const bleedness = lerp(prev === "bleed" ? 1 : 0, cur === "bleed" ? 1 : 0, k);
  const s = dst.w / src.w;
  const video = (file: string, transparent?: boolean) => (
    <OffthreadVideo src={staticFile(file)} muted transparent={transparent} style={{ position: "absolute", left: dst.x - src.x * s, top: dst.y - src.y * s, width: SRC.w * s, height: SRC.h * s, filter: GRADE, maxWidth: "none" }} />
  );
  const fade = `linear-gradient(180deg, transparent 0px, black ${Math.round(220 * bleedness)}px)`;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {/* the warm glow behind the head where it crosses the card's edge */}
      <div style={{ position: "absolute", left: dst.x + dst.w / 2 - 300, top: dst.y - 120, width: 600, height: 240, borderRadius: "50%", background: `radial-gradient(closest-side, ${alpha(LOOK.accent, 0.22)}, transparent)`, opacity: cardness }} />
      <div style={{ position: "absolute", left: dst.x, top: dst.y, width: dst.w, height: dst.h, borderRadius: r, overflow: "hidden", boxShadow: cardness ? `0 40px 90px rgba(0,0,0,${0.55 * cardness})` : "none", border: cardness ? `1.5px solid rgba(255,255,255,${0.08 * cardness})` : "none", WebkitMaskImage: bleedness ? fade : undefined, maskImage: bleedness ? fade : undefined }}>
        <div style={{ position: "absolute", left: -dst.x, top: -dst.y, width: 1080, height: 1920 }}>{video(`${clip}/talk.mp4`)}</div>
      </div>
      {/* the pop-out: only the cut-out above the card's top edge */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: dst.y + 2, overflow: "hidden", opacity: cardness }}>{video(`${clip}/cutout.webm`, true)}</div>
    </AbsoluteFill>
  );
};

/** One or two lines; the accent words in the accent colour. */
const Caption: React.FC<{ lines: string[]; accent: string[] }> = ({ lines, accent }) => {
  const f = useCurrentFrame();
  return (
    <div dir={BRAND.dir} style={{ position: "absolute", top: 300, left: 60, right: 60, textAlign: "center", fontFamily }}>
      {lines.map((line, li) => {
        const size = Math.min(78, 1500 / Math.max(10, line.length));
        const words = line.split(" ");
        return (
          <div key={li} style={{ fontSize: size, fontWeight: 800, lineHeight: 1.35, color: LOOK.text, textShadow: glow("#ffffff", 18, 0.18), ...appear(f, li * 6, 9, 14) }}>
            {words.map((w, wi) => {
              const isAccent = accent.includes(w) || accent.includes(w.replace(/[.,،؟?!:;]+$/, ""));
              // In right-to-left text, keep a Latin word left-to-right but its
              // trailing punctuation outside, so it still ends the line.
              let word: React.ReactNode = w;
              if (BRAND.rtl && /[A-Za-z]/.test(w)) {
                const m = w.match(/^(.*?)([.,،؟?!]*)$/) as RegExpMatchArray;
                word = (<><bdi>{m[1]}</bdi>{m[2]}</>);
              }
              return (
                <span key={wi} style={isAccent ? { color: LOOK.accent, textShadow: glow(LOOK.accent, 24, 0.55) } : undefined}>
                  {word}
                  {wi < words.length - 1 ? " " : ""}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

/** Small accent figures drifting near the sides. */
const Particles: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {[...Array(30)].map((_, i) => {
        const side = random(`s${i}`) < 0.5;
        const x = side ? 30 + random(`x${i}`) * 140 : 910 + random(`x${i}`) * 140;
        const y0 = 420 + random(`y${i}`) * 1200;
        const y = ((y0 - f * (0.3 + random(`v${i}`) * 0.4) - 420 + 1200 * 10) % 1200) + 420;
        const tw = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(f / (14 + random(`t${i}`) * 20) + i));
        const person = random(`p${i}`) < 0.55;
        const sz = person ? 18 + random(`z${i}`) * 10 : 5;
        return person ? (
          <svg key={i} width={sz} height={sz} viewBox="0 0 24 24" style={{ position: "absolute", left: x, top: y, opacity: tw }}>
            <circle cx="12" cy="7" r="4.5" fill={LOOK.accent} />
            <path d="M3 22c1-5.5 4.6-8.5 9-8.5s8 3 9 8.5z" fill={LOOK.accent} />
          </svg>
        ) : (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: sz, height: sz, borderRadius: 2, background: LOOK.accent, opacity: tw * 0.7 }} />
        );
      })}
    </AbsoluteFill>
  );
};

/** Moving film grain from one noise tile. */
const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundImage: `url(${staticFile("talk/grain.png")})`, backgroundPosition: `${(f * 137) % 384}px ${(f * 263) % 384}px`, opacity: 0.075, mixBlendMode: "overlay", pointerEvents: "none" }} />
  );
};

export const TalkVideo: React.FC<Props> = ({ clip, scenes, talk, tail, sfx }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const f = useCurrentFrame();
  if (!talk) return null;
  const end = talk.seconds;
  const out = 1 - clamp01((f - (durationInFrames - 12)) / 12);
  const shown = clip ? scenes : scenes.map((s) => ({ ...s, face: "hidden" as const }));
  return (
    <AbsoluteFill style={{ background: LOOK.bg, fontFamily }}>
      {/* a soft light pool under the widget zone */}
      <div style={{ position: "absolute", left: 140, top: 560, width: 800, height: 460, borderRadius: "50%", background: `radial-gradient(closest-side, ${alpha(LOOK.second, 0.1)}, transparent)` }} />
      {BRAND.particles ? <Particles /> : null}
      {clip ? <Audio src={staticFile(`${clip}/talk.mp4`)} /> : null}
      <AbsoluteFill style={{ opacity: out }}>
        {clip ? <FaceLayer clip={clip} scenes={shown} cuts={talk.cuts} /> : null}
        {shown.map((s, i) => {
          const from = Math.round(s.from * fps);
          const to = Math.round((shown[i + 1]?.from ?? end + tail) * fps);
          const W = WIDGETS[s.widget.kind];
          const { kind, steps, ...p } = s.widget;
          return (
            <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)} layout="none">
              <SceneFade d={to - from} last={i === shown.length - 1}>
                <Caption lines={s.caption} accent={s.accent} />
                {/* Without the face the widget takes the middle of the screen, a little bigger. */}
                <div dir={BRAND.dir} style={{ position: "absolute", top: s.face === "hidden" ? 760 : 548, left: 0, right: 0, height: 440, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${s.face === "hidden" ? 1.12 : 0.92})` }}>
                  {W ? <WidgetFrame W={W} d={to - from} steps={(steps ?? []).map((x) => Math.round((x - s.from) * fps))} p={p} /> : <div style={{ color: LOOK.bad, fontSize: 40 }}>unknown widget: {kind}</div>}
                </div>
              </SceneFade>
              {sfx && i > 0 ? <Audio src={staticFile("sfx/whoosh.wav")} volume={0.12} /> : null}
              {sfx && kind === "button" && steps?.[0] ? (
                <Sequence from={Math.round((steps[0] - s.from) * fps)} layout="none">
                  <Audio src={staticFile("sfx/tap.wav")} volume={0.35} />
                </Sequence>
              ) : null}
            </Sequence>
          );
        })}
      </AbsoluteFill>
      {BRAND.grain ? <Grain /> : null}
    </AbsoluteFill>
  );
};

const SceneFade: React.FC<{ d: number; last: boolean; children: React.ReactNode }> = ({ d, last, children }) => {
  const f = useCurrentFrame();
  const o = last ? 1 : interpolate(f, [d - 6, d], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

const WidgetFrame: React.FC<{ W: React.FC<import("./widgets").WidgetProps>; d: number; steps: number[]; p: Record<string, unknown> }> = ({ W, d, steps, p }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return <W f={f} d={d} fps={fps} steps={steps} p={p} />;
};
