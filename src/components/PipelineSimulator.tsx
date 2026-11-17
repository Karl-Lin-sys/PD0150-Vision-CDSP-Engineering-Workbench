import React from 'react';
import { AudienceMode } from '../data/engineeringData';
import { estimatePipelineComplexity, PipelineArch, PipelineParams } from '../utils/complexity';

interface PipelineSimulatorProps {
  params: PipelineParams;
  onChange: (next: PipelineParams) => void;
  audienceMode: AudienceMode;
}

const PRESETS: { label: string; width: number; height: number }[] = [
  { label: '720p Thermal', width: 1280, height: 720 },
  { label: '1080p FHD', width: 1920, height: 1080 },
  { label: '4K UHD', width: 3840, height: 2160 },
];

const ARCH_OPTIONS: { value: PipelineArch; label: string }[] = [
  { value: 'linear_ssm', label: 'Linear SSM (MambaIR)' },
  { value: 'cnn_naf', label: 'Depthwise CNN (NAFNet)' },
  { value: 'classical_cdsp', label: 'Classical CDSP (TNR + WDR)' },
  { value: 'window_transformer', label: 'Window Transformer' },
];

export const PipelineSimulator: React.FC<PipelineSimulatorProps> = ({
  params,
  onChange,
  audienceMode,
}) => {
  const estimate = estimatePipelineComplexity(params);

  const riskTone =
    estimate.memoryRiskFlag === 'Nominal'
      ? 'text-emerald-700'
      : estimate.memoryRiskFlag === 'Elevated'
        ? 'text-amber-700'
        : 'text-rose-700';

  const riskSymbol =
    estimate.memoryRiskFlag === 'Nominal'
      ? '●'
      : estimate.memoryRiskFlag === 'Elevated'
        ? '▲'
        : '✖';

  return (
    <section
      aria-labelledby="simulator-heading"
      className="bg-white border border-slate-200 rounded-xl p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Interactive CDSP & AI-ISP Hardware Budget
          </p>
          <h2 id="simulator-heading" className="text-xl font-semibold text-slate-900 mt-1">
            Frame Complexity & SRAM Tile Estimator
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            {audienceMode === 'toddler'
              ? 'Slide the camera picture size and brain style below to see how much counting work and toy-box space the chip needs!'
              : 'Adjust sensor resolution, temporal burst depth, and NPU architecture to evaluate asymptotic Big-O cost and on-chip SRAM pressure.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          {PRESETS.map((preset) => {
            const active = params.width === preset.width && params.height === preset.height;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange({ ...params, width: preset.width, height: preset.height })}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        <div className="lg:col-span-5 space-y-5">
          <div>
            <label htmlFor="arch-select" className="block text-xs font-medium text-slate-700 mb-1.5">
              Pipeline Architecture
            </label>
            <select
              id="arch-select"
              value={params.architecture}
              onChange={(e) =>
                onChange({ ...params, architecture: e.target.value as PipelineArch })
              }
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {ARCH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="temporal-frames" className="block text-xs font-medium text-slate-700 mb-1.5">
                TNR Frames (T): <span className="font-mono tabular-nums">{params.temporalFrames}</span>
              </label>
              <input
                id="temporal-frames"
                type="range"
                min={1}
                max={8}
                step={1}
                value={params.temporalFrames}
                onChange={(e) =>
                  onChange({ ...params, temporalFrames: Number(e.target.value) })
                }
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <label htmlFor="tile-size" className="block text-xs font-medium text-slate-700 mb-1.5">
                SRAM Tile (px): <span className="font-mono tabular-nums">{params.tileSize}</span>
              </label>
              <input
                id="tile-size"
                type="range"
                min={64}
                max={256}
                step={64}
                value={params.tileSize}
                onChange={(e) => onChange({ ...params, tileSize: Number(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Super-Resolution Scale
              </span>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {([1, 2, 4] as const).map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => onChange({ ...params, scaleFactor: scale })}
                    className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      params.scaleFactor === scale
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {scale}×
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium text-slate-700 mb-1.5">
                Quantization Precision
              </span>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {([8, 16] as const).map((bits) => (
                  <button
                    key={bits}
                    type="button"
                    onClick={() => onChange({ ...params, bitDepth: bits })}
                    className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      params.bitDepth === bits
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {bits === 8 ? 'INT8' : 'FP16'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500">Time Complexity (Big-O)</p>
            <p className="text-lg font-mono font-semibold text-slate-900 mt-1 tabular-nums">
              {estimate.timeBigO}
            </p>
            <p className="text-xs font-mono text-slate-600 mt-2 tabular-nums">
              ~{estimate.relativeOpsMillions.toLocaleString('en-CA')} M relative ops / frame
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500">Space Complexity (Big-O)</p>
            <p className="text-lg font-mono font-semibold text-slate-900 mt-1 tabular-nums">
              {estimate.spaceBigO}
            </p>
            <p className="text-xs font-mono text-slate-600 mt-2 tabular-nums">
              SRAM Tile: {estimate.sramTileKb.toFixed(1)} KB · DRAM: {estimate.frameBufferMb.toFixed(2)} MB
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500">Hardware Memory Status</p>
            <p className={`text-base font-semibold mt-1 ${riskTone}`}>
              <span aria-hidden="true" className="mr-1.5">{riskSymbol}</span>
              {estimate.memoryRiskFlag}
            </p>
            <p className="text-xs font-mono text-slate-600 mt-2 tabular-nums">
              {params.width}×{params.height} → {params.width * params.scaleFactor}×{params.height * params.scaleFactor} px
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-500">Leakage & Bias Guardrail</p>
            <p className="text-xs text-slate-700 leading-relaxed mt-1.5">
              {estimate.biasGuidance}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
