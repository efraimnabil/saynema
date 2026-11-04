import React from "react";
import { Composition } from "remotion";
import { TalkVideo, calculateTalkVideo, talkVideoSchema } from "./TalkVideo";
import example from "../videos/example/video.json";

/**
 * One composition. Render a video by passing its scenes as props:
 *   npx remotion render TalkVideo out.mp4 --props=videos/<id>/video.json
 * (scripts/render.mjs does this for you.)
 */
export const RemotionRoot: React.FC = () => (
  <Composition
    id="TalkVideo"
    component={TalkVideo}
    schema={talkVideoSchema}
    defaultProps={talkVideoSchema.parse(example)}
    calculateMetadata={calculateTalkVideo}
    durationInFrames={300}
    fps={30}
    width={1080}
    height={1920}
  />
);
