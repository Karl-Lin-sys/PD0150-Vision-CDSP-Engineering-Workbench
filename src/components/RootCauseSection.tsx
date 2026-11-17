import React, { useState } from 'react';
import { AudienceMode, ROOT_CAUSES_AND_SOLUTIONS } from '../data/engineeringData';

interface RootCauseSectionProps {
  audienceMode: AudienceMode;
}

export const RootCauseSection: React.FC<RootCauseSectionProps> = ({ audienceMode }) => {
  const [selectedId, setSelectedId] = useState<string>(ROOT_CAUSES_AND_SOLUTIONS[0].id);

  const selected =
    ROOT_CAUSES_AND_SOLUTIONS.find((item) => item.id === selectedId) ??
    ROOT_CAUSES_AND_SOLUTIONS[0];

  return (
    <section id="root-causes" aria-labelledby="root-causes-heading" className="space-y-6">
      <div>
        <p className="text-xs font-medium text-slate-500">
          03. Structural Defects, Sampling Bias & Verified Issue Resolutions (5-Year Literature)
        </p>
        <h2 id="root-causes-heading" className="text-2xl font-semibold text-slate-900 mt-1">
          Root Cause Analysis & Three Grounded Solutions
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          {audienceMode === 'toddler'
            ? 'Why do camera brains sometimes stumble, and what are the three smart ways scientists fix them?'
            : 'Inspect each algorithmic failure mode or dataset selection bias alongside its peer-reviewed and framework-verified remediation.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 flex flex-col gap-3">
          {ROOT_CAUSES_AND_SOLUTIONS.map((item) => {
            const active = item.id === selected.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`text-left p-5 rounded-xl border transition-colors cursor-pointer ${
                  active
                    ? 'bg-white border-blue-600 ring-1 ring-blue-600'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xs text-slate-500">{item.defectType}</div>
                <div className="text-sm font-semibold text-slate-900 mt-1">
                  {item.defectTitle}
                </div>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div>
              <div className="text-xs text-slate-500">{selected.defectType}</div>
              <h3 className="text-lg font-semibold text-slate-900 mt-1">
                {selected.solutionTitle}
              </h3>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-700">Identified Root Cause</h4>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                  {selected.rootCause}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-700">
                  Primary Evidence (Peer-Reviewed / Official Issue Tracker)
                </h4>
                <p className="text-sm text-slate-800 mt-1 leading-relaxed">
                  {selected.theoryAndSource}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-700">
                  {audienceMode === 'toddler' ? 'Toddler-Friendly Canadian Summary' : 'Concrete Engineering Fix'}
                </h4>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                  {audienceMode === 'toddler'
                    ? selected.toddlerAnalogy
                    : selected.concreteImplementation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
