# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = ["mediapipe==0.10.21", "opencv-python-headless>=4.10", "numpy<2"]
# ///
"""Person matte on any OS with MediaPipe's selfie segmenter.

    uv run scripts/matte.py <in.mp4> <mask.mp4> <model.tflite>

Writes a grey video the same size and frame rate as the input (white = person).
ffmpeg decodes and encodes, so every codec ffmpeg reads works on every OS.
"""
import json, subprocess, sys, time
import cv2, numpy as np, mediapipe as mp

src, dst, model = sys.argv[1], sys.argv[2], sys.argv[3]
probe = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate",
                                   "-of", "json", src], capture_output=True, check=True).stdout)["streams"][0]
w, h = probe["width"], probe["height"]
num, den = (int(x) for x in probe["r_frame_rate"].split("/"))
fps = num / den

seg = mp.tasks.vision.ImageSegmenter.create_from_options(mp.tasks.vision.ImageSegmenterOptions(
    base_options=mp.tasks.BaseOptions(model_asset_path=model),
    running_mode=mp.tasks.vision.RunningMode.VIDEO,
    output_confidence_masks=True))

dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "gray", "-s", f"{w}x{h}", "-r", probe["r_frame_rate"],
                        "-i", "-", "-c:v", "libx264", "-crf", "12", "-pix_fmt", "yuv420p", dst], stdin=subprocess.PIPE)
size = w * h * 3
prev, n, t0 = None, 0, time.time()
while True:
    buf = dec.stdout.read(size)
    if len(buf) < size:
        break
    frame = np.frombuffer(buf, np.uint8).reshape(h, w, 3)
    res = seg.segment_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=frame), int(n * 1000 / fps))
    person = 1.0 - res.confidence_masks[0].numpy_view()  # mask 0 is the background
    person = cv2.resize(person, (w, h), interpolation=cv2.INTER_CUBIC)
    prev = person if prev is None else 0.6 * person + 0.4 * prev  # steadier edges between frames
    m = np.clip((prev - 0.15) / 0.7, 0, 1)  # a firm core, a soft edge
    enc.stdin.write((m * 255).astype(np.uint8).tobytes())
    n += 1
    if n % 150 == 0:
        print(f"{n} frames", flush=True)
enc.stdin.close(); enc.wait(); dec.wait()
print(f"done: {n} frames in {time.time() - t0:.0f}s -> {dst}")
