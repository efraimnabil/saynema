// Person matte with Apple's own Vision framework (no downloads): reads a
// video, writes a same-size grey mask video (white = person).
//
//   swift scripts/matte-mac.swift <in.mp4> <mask.mp4>
import AVFoundation
import CoreImage
import Vision

let args = CommandLine.arguments
guard args.count == 3 else { print("usage: swift scripts/matte-mac.swift <in.mp4> <mask.mp4>"); exit(1) }
let input = URL(fileURLWithPath: args[1]), output = URL(fileURLWithPath: args[2])
try? FileManager.default.removeItem(at: output)

let asset = AVURLAsset(url: input)
let sem = DispatchSemaphore(value: 0)
var track: AVAssetTrack!
var size = CGSize.zero
var fps: Float = 30
Task {
  track = try! await asset.loadTracks(withMediaType: .video).first!
  size = try! await track.load(.naturalSize)
  fps = try! await track.load(.nominalFrameRate)
  sem.signal()
}
sem.wait()

let reader = try AVAssetReader(asset: asset)
let rOut = AVAssetReaderTrackOutput(track: track, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
reader.add(rOut)
let writer = try AVAssetWriter(outputURL: output, fileType: .mp4)
let wIn = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: size.width, AVVideoHeightKey: size.height,
  AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: 20_000_000],
])
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: wIn, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
  kCVPixelBufferWidthKey as String: size.width, kCVPixelBufferHeightKey as String: size.height,
])
writer.add(wIn)
reader.startReading()
writer.startWriting()
writer.startSession(atSourceTime: .zero)

let ctx = CIContext()
let request = VNGeneratePersonSegmentationRequest()
request.qualityLevel = .accurate
request.outputPixelFormat = kCVPixelFormatType_OneComponent8
var n = 0
while let sample = rOut.copyNextSampleBuffer(), let px = CMSampleBufferGetImageBuffer(sample) {
  let time = CMSampleBufferGetPresentationTimeStamp(sample)
  let handler = VNImageRequestHandler(cvPixelBuffer: px, options: [:])
  try handler.perform([request])
  guard let mask = request.results?.first?.pixelBuffer else { continue }
  var img = CIImage(cvPixelBuffer: mask)
  img = img.transformed(by: CGAffineTransform(scaleX: size.width / img.extent.width, y: size.height / img.extent.height))
  var outPx: CVPixelBuffer?
  CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &outPx)
  ctx.render(img, to: outPx!, bounds: CGRect(origin: .zero, size: size), colorSpace: CGColorSpaceCreateDeviceGray())
  while !wIn.isReadyForMoreMediaData { usleep(2000) }
  adaptor.append(outPx!, withPresentationTime: time)
  n += 1
  if n % 150 == 0 { print("\(n) frames") }
}
wIn.markAsFinished()
writer.finishWriting { sem.signal() }
sem.wait()
print("done: \(n) frames → \(output.path)")
