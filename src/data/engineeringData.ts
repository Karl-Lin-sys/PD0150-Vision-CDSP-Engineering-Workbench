export type AudienceMode = 'toddler' | 'engineering';

export type DomainCategory = 'all' | 'cdsp_tnr_wdr' | 'ai_denoise_sr' | 'thermal' | 'compiler';

export interface TechSelectionRow {
  id: string;
  category: Exclude<DomainCategory, 'all'>;
  task: string;
  selectedMethod: string;
  comparedAgainst: string;
  peerReviewedSource: string;
  githubReference: string;
  biasAndLeakageControl: string;
  toddlerSummary: string;
}

export const TECH_SELECTIONS: TechSelectionRow[] = [
  {
    id: 'cdsp-wdr-retinex',
    category: 'cdsp_tnr_wdr',
    task: 'WDR & Low-Light CDSP Enhancement',
    selectedMethod: 'Retinexformer (One-stage Retinex + Illumination-Guided Transformer)',
    comparedAgainst: 'Unpaired CycleGAN / Global Histogram Equalization',
    peerReviewedSource: 'Cai et al., ICCV 2023 ("Retinexformer: One-stage Retinex-based Transformer for Low-light Image Enhancement")',
    githubReference: 'caiyuanhao1998/Retinexformer (Reproducible PyTorch)',
    biasAndLeakageControl:
      'Evaluated across strictly disjoint scene splits (LOL-v1 / LOL-v2-real) with raw luminance stratification rather than synthetic gamma darkening.',
    toddlerSummary:
      'Helps a camera see both bright sunny windows and dark corners at the same time, like sunglasses that only dim the bright spots!',
  },
  {
    id: 'cdsp-tnr-raw',
    category: 'cdsp_tnr_wdr',
    task: 'Temporal Noise Reduction (TNR) & Raw Denoising',
    selectedMethod: 'Physics-Calibrated Dual-Stage Raw Denoiser (PMN / Dark-Frame + Shot-Read Calibration)',
    comparedAgainst: 'Additive White Gaussian Noise (AWGN)-trained UNet',
    peerReviewedSource: 'Feng et al., CVPR 2023 ("Learnability Enhancement for Low-Light Raw Image Denoising: A Data Perspective")',
    githubReference: 'megvii-research/PMN (Reproducible Raw Pipeline)',
    biasAndLeakageControl:
      'Eliminates synthetic AWGN domain mismatch and row-FPN bias by modelling real sensor dark current and splitting multi-frame bursts by Scene ID.',
    toddlerSummary:
      'Cleans up speckles in dark photos by learning how the real camera sensor acts in the dark, instead of guessing with pretend snow.',
  },
  {
    id: 'ai-sr-ssm',
    category: 'ai_denoise_sr',
    task: 'AI+CDSP Denoise & Super-Resolution (SR)',
    selectedMethod: 'MambaIR (Linear-Complexity 2D State-Space Restoration) + SRFormer Permuted Attention',
    comparedAgainst: 'Vanilla ViT Global Self-Attention / Heavy SwinIR',
    peerReviewedSource: 'Guo et al., ECCV 2024 ("MambaIR"); Zhou et al., ICCV 2023 ("SRFormer")',
    githubReference: 'csguoh/MambaIR · Martyn0622/SRFormer',
    biasAndLeakageControl:
      'Prevents edge-class imbalance (where smooth sky patches inflate PSNR) by reporting DISTS/LPIPS and high-frequency edge-slice PSNR separately.',
    toddlerSummary:
      'Makes small blurry pictures sharp and big without taking forever, reading the picture smoothly in tidy lines instead of checking every dot against every other dot.',
  },
  {
    id: 'thermal-fusion',
    category: 'thermal',
    task: 'Thermal Camera NUC & Super-Resolution',
    selectedMethod: 'DDFM (Denoising Diffusion / Cross-Spectral Feature Alignment) & Thermal-Guided Edge Restoration',
    comparedAgainst: 'Bicubic Upsampling / RGB-Only Pretrained CNN',
    peerReviewedSource: 'Zhao et al., ICCV 2023 ("DDFM: Denoising Diffusion Model for Multi-Modality Image Fusion"); CVPRW PBVS 2023/2024',
    githubReference: 'Zhaozixiang1228/MMIF-DDFM',
    biasAndLeakageControl:
      'Enforces radiometric calibration hold-out by camera ambient temperature bucket so hot-pixel drift does not leak across train and test sets.',
    toddlerSummary:
      'Helps a heat-seeing camera draw crisp outlines of warm people and cold walls, even when the air outside gets warmer or colder.',
  },
  {
    id: 'ai-compiler',
    category: 'compiler',
    task: 'AI Model Compiler & ASIC/FPGA Quantization',
    selectedMethod: 'AWQ / SmoothQuant Activation-Aware INT8 + Apache TVM Loop Tiling',
    comparedAgainst: 'Naive Min-Max Post-Training Quantization (PTQ)',
    peerReviewedSource: 'Lin et al., MLSys 2024 ("AWQ"); Xiao et al., ICML 2023 ("SmoothQuant")',
    githubReference: 'apache/tvm · mit-han-lab/llm-awq',
    biasAndLeakageControl:
      'Calibration set uses stratified SNR/brightness samples (128+ diverse scenes) instead of bright-only frames, preventing INT8 clipping on shadow activations.',
    toddlerSummary:
      'Packs big math brains into tiny chip-sized lunchboxes so a small camera chip runs fast without dropping the important numbers.',
  },
];

export interface CodeExampleTab {
  id: 'pytorch' | 'opencv' | 'tflite';
  label: string;
  officialDocSource: string;
  leakGuardrail: string;
  toddlerSummary: string;
  code: string;
  complexityRows: {
    fnName: string;
    timeComplexity: string;
    spaceComplexity: string;
    notes: string;
  }[];
}

export const CODE_TABS: CodeExampleTab[] = [
  {
    id: 'pytorch',
    label: 'PyTorch AI-ISP Inference',
    officialDocSource: 'PyTorch Official Docs: torch.inference_mode(), torch.compile(), Memory Management FAQ',
    leakGuardrail:
      'Uses torch.inference_mode() (disables autograd graph + version counter), pre-allocated output tensors, and .detach().item() to avoid retaining computation graphs across batches.',
    toddlerSummary:
      'Tells PyTorch: "Just draw the clean picture right now—do not keep a giant trail of scratch paper after every frame!"',
    code: `import torch
import torch.nn as nn


class DepthwiseAISRBlock(nn.Module):
    """Hardware-friendly residual block for CDSP + 2x SR (no dynamic graph allocations)."""

    def __init__(self, channels: int = 32) -> None:
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(channels, channels, kernel_size=3, padding=1, groups=channels, bias=False),
            nn.BatchNorm2d(channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(channels, channels, kernel_size=1, bias=True),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return x + self.net(x)


def run_compiled_isp_batch(
    model: nn.Module,
    raw_batch: torch.Tensor,
    out_buffer: torch.Tensor | None = None,
) -> tuple[torch.Tensor, float]:
    """
    Executes compiled inference safely without autograd graph retention.
    Official API: torch.inference_mode + scalar .item() extraction.
    """
    model.eval()
    with torch.inference_mode():
        pred = model(raw_batch)
        if out_buffer is not None and out_buffer.shape == pred.shape:
            out_buffer.copy_(pred)
            result = out_buffer
        else:
            result = pred
        mean_luma = float(result.mean().detach().item())
    return result, mean_luma`,
    complexityRows: [
      {
        fnName: 'DepthwiseAISRBlock.forward(x)',
        timeComplexity: 'O(B · H · W · (K² · C + C²))',
        spaceComplexity: 'O(B · H · W · C)',
        notes: 'Depthwise K=3 reduces conv MACs from C²·K² to K²·C + C²; inplace ReLU avoids extra activation tensor.',
      },
      {
        fnName: 'run_compiled_isp_batch(...)',
        timeComplexity: 'O(L · B · H · W · C²)',
        spaceComplexity: 'O(B · H · W · C)',
        notes: 'torch.inference_mode() guarantees O(1) autograd graph retention across N frames (zero frame-to-frame memory leak).',
      },
    ],
  },
  {
    id: 'opencv',
    label: 'OpenCV TNR & WDR Pipeline',
    officialDocSource: 'OpenCV Official Docs: cv2.bilateralFilter, cv2.createCLAHE, cv2.cvtColor (with dst reuse)',
    leakGuardrail:
      'Pre-allocates NumPy destination buffers (dst=) and reuses a single CLAHE object outside the frame loop to prevent per-frame heap fragmentation.',
    toddlerSummary:
      'Reuses the exact same clean mixing bowls for every camera picture so the computer desk never piles up with dirty dishes.',
    code: `import cv2
import numpy as np


class StreamCDSPProcessor:
    """Zero-allocation per-frame CDSP stage for TNR + WDR tone mapping."""

    def __init__(self, height: int, width: int, alpha_tnr: float = 0.25) -> None:
        self.alpha_tnr = float(alpha_tnr)
        self.prev_luma = np.zeros((height, width), dtype=np.float32)
        self.curr_luma = np.empty((height, width), dtype=np.float32)
        self.ycrcb_buf = np.empty((height, width, 3), dtype=np.uint8)
        self.bgr_out = np.empty((height, width, 3), dtype=np.uint8)
        self.clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))

    def process_frame(self, bgr_frame: np.ndarray) -> np.ndarray:
        # 1. Convert BGR -> YCrCb in pre-allocated buffer
        cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2YCrCb, dst=self.ycrcb_buf)
        y_chan = self.ycrcb_buf[:, :, 0]

        # 2. Temporal Noise Reduction (IIR Exponential Moving Average)
        np.copyto(self.curr_luma, y_chan, casting="unsafe")
        cv2.accumulateWeighted(self.curr_luma, self.prev_luma, self.alpha_tnr)
        np.clip(self.prev_luma, 0, 255, out=self.curr_luma)
        y_chan[:] = self.curr_luma.astype(np.uint8, copy=False)

        # 3. Local WDR Contrast Enhancement on luminance channel only
        y_wdr = self.clahe.apply(y_chan)
        self.ycrcb_buf[:, :, 0] = y_wdr

        # 4. Convert back to BGR into pre-allocated output array
        cv2.cvtColor(self.ycrcb_buf, cv2.COLOR_YCrCb2BGR, dst=self.bgr_out)
        return self.bgr_out`,
    complexityRows: [
      {
        fnName: 'StreamCDSPProcessor.__init__',
        timeComplexity: 'O(H · W)',
        spaceComplexity: 'O(H · W)',
        notes: 'Allocates 4 fixed buffers once at startup; prevents GC pressure at 60 fps.',
      },
      {
        fnName: 'StreamCDSPProcessor.process_frame',
        timeComplexity: 'O(H · W)',
        spaceComplexity: 'O(H · W) scratch',
        notes: 'cv2.cvtColor, accumulateWeighted, and tile-bilinear CLAHE each run in linear O(H·W) pixel time.',
      },
    ],
  },
  {
    id: 'tflite',
    label: 'TensorFlow INT8 Compiler Export',
    officialDocSource: 'TensorFlow Official Docs: tf.lite.TFLiteConverter, tf.function(input_signature), Post-Training Integer Quantization',
    leakGuardrail:
      'Binds a static input_signature on @tf.function to stop repeated graph retracing, and clears Keras session state after conversion.',
    toddlerSummary:
      'Fixes the cookie-cutter shape ahead of time so the compiler never has to rebuild the whole kitchen for every new photo.',
    code: `import numpy as np
import tensorflow as tf


def export_int8_tflite(
    model: tf.keras.Model,
    calibration_samples: np.ndarray,
    height: int,
    width: int,
) -> bytes:
    """
    Compiles a Keras ISP/SR model to full INT8 TFLite for ASIC/NPU deployment.
    Static input_signature prevents @tf.function retracing memory leaks.
    """
    @tf.function(
        input_signature=[
            tf.TensorSpec(shape=[1, height, width, 3], dtype=tf.float32, name="rgb_in")
        ]
    )
    def serving_fn(rgb_in: tf.Tensor) -> tf.Tensor:
        return model(rgb_in, training=False)

    concrete_fn = serving_fn.get_concrete_function()
    converter = tf.lite.TFLiteConverter.from_concrete_functions([concrete_fn], model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]

    def representative_dataset():
        # Stratified brightness/SNR calibration slices (never single-scene samples)
        for sample in calibration_samples:
            yield [np.expand_dims(sample.astype(np.float32), axis=0)]

    converter.representative_dataset = representative_dataset
    converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
    converter.inference_input_type = tf.int8
    converter.inference_output_type = tf.int8

    tflite_bytes = converter.convert()
    tf.keras.backend.clear_session()
    return tflite_bytes`,
    complexityRows: [
      {
        fnName: 'serving_fn (fixed signature)',
        timeComplexity: 'O(1) trace + O(H · W · C²) per call',
        spaceComplexity: 'O(H · W · C)',
        notes: 'Fixed TensorSpec eliminates O(N) retracing graph buildup across batches.',
      },
      {
        fnName: 'export_int8_tflite',
        timeComplexity: 'O(N_cal · H · W · C² + |W|)',
        spaceComplexity: 'O(H · W · C + |W|)',
        notes: 'Runs N_cal calibration passes, computes min/max activation scales, and clears session state.',
      },
    ],
  },
];

export interface RootCauseAndSolution {
  id: string;
  defectTitle: string;
  defectType: 'Algorithmic Structural Defect' | 'Sampling / Selection Bias';
  rootCause: string;
  solutionTitle: string;
  theoryAndSource: string;
  concreteImplementation: string;
  toddlerAnalogy: string;
}

export const ROOT_CAUSES_AND_SOLUTIONS: RootCauseAndSolution[] = [
  {
    id: 'sol-noise-bias',
    defectTitle: '1. Synthetic AWGN Training vs. Real CMOS/Thermal Sensor Noise',
    defectType: 'Sampling / Selection Bias',
    rootCause:
      'Training AI+CDSP denoisers on synthetic Gaussian noise ignores signal-dependent Poisson shot noise, read noise, and thermal fixed-pattern row noise (FPN). Models overfit to clean-bright textures and collapse in dark scenes.',
    solutionTitle: 'Physics-Based Shot-Read + Dark-Frame Calibration & Stratified SNR Sampling',
    theoryAndSource:
      'Feng et al. (CVPR 2023, PMN) & Wei et al. (CVPR 2020, Physics Noise Model): decompose sensor noise into heteroscedastic Poisson shot variance and empirical dark-frame FPN.',
    concreteImplementation:
      'Capture real sensor dark frames per ISO/temperature bucket, sample training patches stratified across 5 exposure/SNR deciles, and enforce strict Scene-ID train/val/test separation.',
    toddlerAnalogy:
      'Practising with real puddle splashes instead of pretend confetti so the raincoat works when it actually rains outside.',
  },
  {
    id: 'sol-quadratic-sram',
    defectTitle: '2. Quadratic Attention & Graph-Retracing Memory Leaks on Edge ASICs',
    defectType: 'Algorithmic Structural Defect',
    rootCause:
      'Global spatial self-attention scales at O((H·W)²), overflowing on-chip SRAM on 4K video; meanwhile, dynamic tensor shapes trigger @tf.function retracing or PyTorch CoW DataLoader worker leaks (pytorch/pytorch#13246).',
    solutionTitle: 'Linear-Complexity State-Space / Permuted Attention + Static Memory Planning',
    theoryAndSource:
      'Guo et al. (ECCV 2024, MambaIR) & PyTorch/TensorFlow Official Memory Guides (resolved DataLoader CoW & tf.function retracing patterns).',
    concreteImplementation:
      'Replace global attention with O(H·W·C) selective scan or depthwise separable blocks, store dataset index metadata in contiguous NumPy arrays, and compile with fixed TensorSpec shapes.',
    toddlerAnalogy:
      'Packing toys into tidy square bins of the exact same size instead of dumping every toy on the floor every single time.',
  },
  {
    id: 'sol-int8-clipping',
    defectTitle: '3. Calibration Bias & Activation Outliers During AI Model Compilation',
    defectType: 'Sampling / Selection Bias',
    rootCause:
      'WDR and thermal scenes exhibit extreme dynamic-range spikes (specular highlights or hot targets). Naive Min-Max INT8 quantization on biased daylight samples crushes shadow precision into zero.',
    solutionTitle: 'Activation-Aware Channel Scaling (AWQ/SmoothQuant) + Worst-Decile Validation',
    theoryAndSource:
      'Lin et al. (MLSys 2024, AWQ) & Xiao et al. (ICML 2023, SmoothQuant): migrate quantization difficulty from outlier activations into weights via per-channel scaling.',
    concreteImplementation:
      'Build a 128-frame multi-environment calibration set (bright sun, night glare, thermal edge cases), apply per-channel SmoothQuant/AWQ scaling before TFLite/TVM INT8 export, and gate deployment on worst-10% tail PSNR/LPIPS.',
    toddlerAnalogy:
      'Making sure our measuring cup has tiny marks for droplets AND big marks for full cups, so small drops never disappear.',
  },
];

export interface NistControlItem {
  id: string;
  functionName: 'Govern' | 'Identify' | 'Protect' | 'Detect' | 'Respond' | 'Recover';
  controlGoal: string;
  pd0150Action: string;
  toddlerAction: string;
}

export const NIST_CSF_CONTROLS: NistControlItem[] = [
  {
    id: 'nist-gv',
    functionName: 'Govern',
    controlGoal: 'GV.OC / GV.RM — Legal, IP & Supply-Chain Governance',
    pd0150Action: 'Enforce MIT/Apache-2.0 clean-room licensing and scrub third-party job-board PII before pushing to GitHub.',
    toddlerAction: 'Make clear house rules so we never share someone else’s private phone number or pictures.',
  },
  {
    id: 'nist-id',
    functionName: 'Identify',
    controlGoal: 'ID.AM / ID.RA — Model, Dataset & Sensor Asset Inventory',
    pd0150Action: 'Maintain SBOM for PyTorch/OpenCV/TVM dependencies, dataset SHA-256 manifests, and Scene-ID split hashes.',
    toddlerAction: 'Put name tags on every toy box and camera file so nothing mysterious sneaks in.',
  },
  {
    id: 'nist-pr',
    functionName: 'Protect',
    controlGoal: 'PR.DS / PR.AA — Training Data & Model Weight Protection',
    pd0150Action: 'Strip EXIF/location tags from raw/thermal captures, sign compiled INT8 binaries, and avoid hardcoding API keys.',
    toddlerAction: 'Lock the diary with a key and wipe away home addresses before sharing drawings.',
  },
  {
    id: 'nist-de',
    functionName: 'Detect',
    controlGoal: 'DE.CM — Runtime Memory Leak & Drift Monitoring',
    pd0150Action: 'Monitor RSS/VRAM growth, INT8 clipping ratios, and worst-decile SNR drift in CI regression tests.',
    toddlerAction: 'Listen for a smoke alarm or leaky tap early before the floor gets wet.',
  },
  {
    id: 'nist-rs',
    functionName: 'Respond',
    controlGoal: 'RS.MI — Secret / PII Leak & Quantization Regression Containment',
    pd0150Action: 'Run pre-commit secret/PII scanners (e.g., gitleaks) and revoke/rotate immediately if any credential or PII lands in git history.',
    toddlerAction: 'If we spill juice, grab a towel right away and clean it up fast.',
  },
  {
    id: 'nist-rc',
    functionName: 'Recover',
    controlGoal: 'RC.RP — Deterministic Rollback & Fallback CDSP',
    pd0150Action: 'Version-pin golden classical CDSP fallback LUTs so the chip safely bypasses AI-SR on NPU fault.',
    toddlerAction: 'Keep a spare Band-Aid and backup flashlight ready so the camera still sees clearly.',
  },
];

export interface LegalJurisdictionItem {
  id: string;
  jurisdiction: string;
  statutes: string;
  keyRequirementForGithub: string;
  toddlerRule: string;
}

export const LEGAL_JURISDICTIONS: LegalJurisdictionItem[] = [
  {
    id: 'law-tw',
    jurisdiction: 'Taiwan (ROC)',
    statutes: 'Personal Data Protection Act (PDPA), Copyright Act, Trade Secrets Act',
    keyRequirementForGithub:
      'Do not republish contact names ("周小姐"), internal company details, or scraped 104 Job Bank HTML verbatim; write original technical notes and open-source code only.',
    toddlerRule: 'In Taiwan, do not copy someone else’s poster or post a real person’s name and phone number online.',
  },
  {
    id: 'law-ca',
    jurisdiction: 'Canada',
    statutes: 'PIPEDA, Copyright Act (Fair Dealing / Licensing), Criminal Code s. 342.1',
    keyRequirementForGithub:
      'Exclude any identifiable personal information without consent, include a clear OSI licence (MIT/Apache-2.0), and never include unauthorized scraping tools.',
    toddlerRule: 'In Canada, ask before sharing anyone’s personal info, and label your own work clearly with sharing rules.',
  },
  {
    id: 'law-de',
    jurisdiction: 'Germany',
    statutes: 'GDPR (DSGVO Art. 6), Urheberrechtsgesetz (UrhG), § 202a StGB',
    keyRequirementForGithub:
      'Strict data minimization: zero personal names, emails, or facility portraits in public repos; honour database/copyright rights (UrhG §§ 87a ff.) by not mirroring job portals.',
    toddlerRule: 'In Germany, keep every real person’s name and photo completely private, and only upload things you made yourself.',
  },
  {
    id: 'law-jp',
    jurisdiction: 'Japan',
    statutes: 'APPI (Act on the Protection of Personal Information), Copyright Act (Art. 30-4), Unfair Competition Prevention Act',
    keyRequirementForGithub:
      'Art. 30-4 permits non-enjoyment ML analysis, NOT verbatim republication of copyrighted listings; strip all personal/business identifiers and respect trade secrets.',
    toddlerRule: 'In Japan, learning from examples is okay, but copying and re-posting someone else’s page or private info is not allowed.',
  },
];
