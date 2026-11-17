import test from 'node:test';
import assert from 'node:assert/strict';
import { estimatePipelineComplexity } from './complexity';

test('estimatePipelineComplexity scales linearly with resolution for NAF/CNN', () => {
  const hd = estimatePipelineComplexity({
    width: 1280,
    height: 720,
    channels: 16,
    temporalFrames: 1,
    scaleFactor: 2,
    bitDepth: 16,
    architecture: 'cnn_naf',
    tileSize: 128,
  });

  const uhd = estimatePipelineComplexity({
    width: 2560,
    height: 1440,
    channels: 16,
    temporalFrames: 1,
    scaleFactor: 2,
    bitDepth: 16,
    architecture: 'cnn_naf',
    tileSize: 128,
  });

  assert.equal(uhd.pixelCount, hd.pixelCount * 4);
  assert.equal(uhd.outputPixelCount, hd.outputPixelCount * 4);
  assert.ok(Math.abs(uhd.relativeOpsMillions - hd.relativeOpsMillions * 4) < 0.5);
});

test('estimatePipelineComplexity flags SRAM Overflow Risk for large tile and channel counts', () => {
  const heavy = estimatePipelineComplexity({
    width: 3840,
    height: 2160,
    channels: 64,
    temporalFrames: 8,
    scaleFactor: 4,
    bitDepth: 16,
    architecture: 'window_transformer',
    tileSize: 256,
  });

  assert.equal(heavy.memoryRiskFlag, 'SRAM Overflow Risk');
  assert.ok(heavy.frameBufferMb > 256);
});

test('estimatePipelineComplexity enforces temporal leakage warning when temporalFrames > 1', () => {
  const tnr = estimatePipelineComplexity({
    width: 1920,
    height: 1080,
    channels: 8,
    temporalFrames: 4,
    scaleFactor: 1,
    bitDepth: 8,
    architecture: 'classical_cdsp',
    tileSize: 64,
  });

  assert.match(tnr.biasGuidance, /Scene\/Clip ID/);
});
