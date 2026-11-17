export type PipelineArch = 'linear_ssm' | 'window_transformer' | 'cnn_naf' | 'classical_cdsp';

export interface PipelineParams {
  width: number;
  height: number;
  channels: number;
  temporalFrames: number;
  scaleFactor: 1 | 2 | 4;
  bitDepth: 8 | 16;
  architecture: PipelineArch;
  tileSize: number;
}

export interface ComplexityEstimate {
  pixelCount: number;
  outputPixelCount: number;
  frameBufferMb: number;
  sramTileKb: number;
  relativeOpsMillions: number;
  timeBigO: string;
  spaceBigO: string;
  memoryRiskFlag: 'Nominal' | 'Elevated' | 'SRAM Overflow Risk';
  biasGuidance: string;
}

export function estimatePipelineComplexity(params: PipelineParams): ComplexityEstimate {
  const w = Math.max(64, Math.min(7680, Math.round(params.width)));
  const h = Math.max(64, Math.min(4320, Math.round(params.height)));
  const c = Math.max(1, Math.min(64, Math.round(params.channels)));
  const t = Math.max(1, Math.min(16, Math.round(params.temporalFrames)));
  const s = params.scaleFactor;
  const bytesPerElem = params.bitDepth === 8 ? 1 : 2;
  const tile = Math.max(32, Math.min(512, Math.round(params.tileSize)));

  const pixelCount = w * h;
  const outputPixelCount = pixelCount * s * s;

  // Temporal ring buffer (T frames) + 1 output RGB buffer
  const inputRingBytes = pixelCount * c * t * bytesPerElem;
  const outputBytes = outputPixelCount * 3 * bytesPerElem;
  const frameBufferMb = Number(((inputRingBytes + outputBytes) / (1024 * 1024)).toFixed(2));

  // On-chip SRAM tile footprint: tile^2 * channels * 2 (ping-pong buffers)
  const sramTileKb = Number(((tile * tile * c * 2 * bytesPerElem) / 1024).toFixed(1));

  let opsPerPixel = 1;
  let timeBigO = 'O(T · H · W · C)';
  let spaceBigO = 'O(T · H · W · C)';

  switch (params.architecture) {
    case 'classical_cdsp':
      // Demosaicing (5x5), TNR EMA blend, WDR bilateral/tone LUT
      opsPerPixel = 48 * t;
      timeBigO = 'O(T · H · W · K²)';
      spaceBigO = 'O(T · H · W)';
      break;
    case 'cnn_naf':
      // Depthwise + pointwise 3x3 + channel attention (linear in H*W)
      opsPerPixel = 18 * c * t;
      timeBigO = 'O(T · H · W · C²)';
      spaceBigO = 'O(H · W · C + T · H · W)';
      break;
    case 'linear_ssm':
      // Mamba-style 2D selective scan: linear in H*W with state dim d=16
      opsPerPixel = 24 * c * t;
      timeBigO = 'O(T · H · W · C · d)';
      spaceBigO = 'O(H · W · C)';
      break;
    case 'window_transformer': {
      // Shifted window attention: quadratic within window M^2 (M=8) + linear projection
      const windowArea = 64;
      opsPerPixel = (6 * c + windowArea) * c * t * 0.25;
      timeBigO = 'O(T · H · W · (C² + M² · C))';
      spaceBigO = 'O(H · W · C + (H·W/M²) · M⁴)';
      break;
    }
  }

  const relativeOpsMillions = Number(((pixelCount * opsPerPixel) / 1_000_000).toFixed(1));

  let memoryRiskFlag: ComplexityEstimate['memoryRiskFlag'] = 'Nominal';
  if (sramTileKb > 1536 || frameBufferMb > 512) {
    memoryRiskFlag = 'SRAM Overflow Risk';
  } else if (sramTileKb > 512 || frameBufferMb > 280) {
    memoryRiskFlag = 'Elevated';
  }

  const biasGuidance =
    params.temporalFrames > 1
      ? 'Split datasets strictly by Scene/Clip ID—never by frame index—to block temporal data leakage.'
      : 'Stratify raw training crops across luminance/SNR bins so bright flat regions do not skew PSNR.';

  return {
    pixelCount,
    outputPixelCount,
    frameBufferMb,
    sramTileKb,
    relativeOpsMillions,
    timeBigO,
    spaceBigO,
    memoryRiskFlag,
    biasGuidance,
  };
}
