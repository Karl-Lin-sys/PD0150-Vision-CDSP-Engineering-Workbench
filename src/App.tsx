import { useState } from 'react';
import { Header } from './components/Header';
import { PipelineSimulator } from './components/PipelineSimulator';
import { TechSelectionSection } from './components/TechSelectionSection';
import { CodeAndBigOSection } from './components/CodeAndBigOSection';
import { RootCauseSection } from './components/RootCauseSection';
import { ComplianceAndLegalSection } from './components/ComplianceAndLegalSection';
import { AudienceMode } from './data/engineeringData';
import { PipelineParams } from './utils/complexity';
import { buildCleanReadmeMarkdown } from './utils/redactor';

export default function App() {
  const [audienceMode, setAudienceMode] = useState<AudienceMode>('toddler');
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [pipelineParams, setPipelineParams] = useState<PipelineParams>({
    width: 1920,
    height: 1080,
    channels: 32,
    temporalFrames: 4,
    scaleFactor: 2,
    bitDepth: 8,
    architecture: 'linear_ssm',
    tileSize: 128,
  });

  const [checkedControls, setCheckedControls] = useState<Record<string, boolean>>({
    'nist-gv': true,
    'nist-id': true,
    'nist-pr': true,
    'nist-de': false,
    'nist-rs': false,
    'nist-rc': true,
  });

  const handleToggleControl = (id: string) => {
    setCheckedControls((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExportBundle = () => {
    const markdown = buildCleanReadmeMarkdown(
      'PD0150 CDSP & AI-ISP Clean Reference',
      'Peer-reviewed CDSP/TNR/WDR, AI Super-Resolution, Thermal Imaging, and INT8 Compiler reference architecture in Canadian English. Excludes all personal data and third-party job-board text.'
    );
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'PD0150-Clean-Reference-README.md';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setExportMessage(
      'Downloaded clean, PII-free README.md. Push manually to your own GitHub repository with your personal PAT/SSH key (no GitHub credentials exist in this environment).'
    );
  };

  return (
    <div id="top" className="min-h-screen bg-slate-50 text-slate-900">
      <Header onExportBundle={handleExportBundle} />

      <main className="max-w-7xl mx-auto px-6 py-10 md:py-14 space-y-14">
        <section aria-labelledby="hero-heading" className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="text-xs font-medium text-slate-500">
                Canadian English Technical Brief · Peer-Reviewed Sources Only · NIST CSF 2.0
              </div>
              <h1
                id="hero-heading"
                className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 [text-wrap:balance]"
              >
                {audienceMode === 'toddler'
                  ? 'How a Tiny Camera Chip Makes Dark, Blurry Pictures Bright and Clear'
                  : 'CDSP, AI Super-Resolution, Thermal Imaging & Model Compiler Architecture'}
              </h1>
              <p className="text-base text-slate-600 leading-relaxed">
                {audienceMode === 'toddler'
                  ? 'Think of a camera chip like a careful painter with tiny crayons. We help it clean up dark speckles, see warm colours in the dark, and stay safe and polite under the rules in Taiwan, Canada, Germany, and Japan!'
                  : 'An objective architectural evaluation for embedded vision & AI-ISP pipelines (CDSP, TNR, WDR, demosaicing, super-resolution, thermal fusion, and INT8 compilation) free from synthetic-noise bias, temporal data leakage, and framework memory leaks.'}
              </p>
            </div>

            <div className="shrink-0 space-y-2">
              <span className="block text-xs font-medium text-slate-500">
                Explanation Level (Canadian English)
              </span>
              <div
                role="group"
                aria-label="Explanation level"
                className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg"
              >
                <button
                  type="button"
                  onClick={() => setAudienceMode('toddler')}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    audienceMode === 'toddler'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Toddler-Simple (CA)
                </button>
                <button
                  type="button"
                  onClick={() => setAudienceMode('engineering')}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    audienceMode === 'engineering'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Engineering Rigour
                </button>
              </div>
            </div>
          </div>

          {exportMessage && (
            <div
              role="status"
              className="bg-white border border-blue-200 rounded-xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-slate-800"
            >
              <span>{exportMessage}</span>
              <button
                type="button"
                onClick={() => setExportMessage(null)}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}
        </section>

        <PipelineSimulator
          params={pipelineParams}
          onChange={setPipelineParams}
          audienceMode={audienceMode}
        />

        <TechSelectionSection audienceMode={audienceMode} />

        <CodeAndBigOSection audienceMode={audienceMode} />

        <RootCauseSection audienceMode={audienceMode} />

        <ComplianceAndLegalSection
          audienceMode={audienceMode}
          checkedControls={checkedControls}
          onToggleControl={handleToggleControl}
        />
      </main>

      <footer className="border-t border-slate-200 bg-white mt-14">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <span>
            PD0150 Vision Workbench · Original reference material only (third-party personal data excluded).
          </span>
          <span>
            Informational engineering guidance — verify cross-border compliance with qualified legal counsel.
          </span>
        </div>
      </footer>
    </div>
  );
}
