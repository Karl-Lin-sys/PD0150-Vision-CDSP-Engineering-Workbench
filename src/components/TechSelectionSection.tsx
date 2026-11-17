import React, { useState } from 'react';
import { AudienceMode, DomainCategory, TECH_SELECTIONS } from '../data/engineeringData';

interface TechSelectionSectionProps {
  audienceMode: AudienceMode;
}

const FILTER_TABS: { id: DomainCategory; label: string }[] = [
  { id: 'all', label: 'All Tracks' },
  { id: 'cdsp_tnr_wdr', label: 'CDSP / TNR / WDR' },
  { id: 'ai_denoise_sr', label: 'AI Denoise & SR' },
  { id: 'thermal', label: 'Thermal Imaging' },
  { id: 'compiler', label: 'AI Model Compiler' },
];

export const TechSelectionSection: React.FC<TechSelectionSectionProps> = ({ audienceMode }) => {
  const [category, setCategory] = useState<DomainCategory>('all');

  const visibleRows =
    category === 'all'
      ? TECH_SELECTIONS
      : TECH_SELECTIONS.filter((row) => row.category === category);

  return (
    <section id="selection" aria-labelledby="selection-heading" className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="max-w-xl">
          <p className="text-xs font-medium text-slate-500">
            01. Peer-Reviewed Literature & GitHub Reference Selection (2023–2025)
          </p>
          <h2 id="selection-heading" className="text-2xl font-semibold text-slate-900 mt-1">
            Technology Selection & Bias Audit
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {audienceMode === 'toddler'
              ? 'We only pick camera tricks tested by top scientists and proven to be fair—never tricks that cheat by peeking at the answer sheet.'
              : 'Every selected architecture is grounded in CVPR, ICCV, ECCV, ICML, or MLSys peer-reviewed publications and verified against scene-disjoint, stratified benchmarks.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start shrink-0">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategory(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                category === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3.5 px-5">PD0150 Workstream</th>
                <th className="py-3.5 px-5">Selected Method vs. Baseline</th>
                <th className="py-3.5 px-5">Peer-Reviewed Source & Repo</th>
                <th className="py-3.5 px-5">
                  {audienceMode === 'toddler' ? 'Plain Canadian Explanation' : 'Leakage & Bias Mitigation'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {visibleRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors align-top">
                  <td className="py-4 px-5 font-medium text-slate-900 min-w-[180px]">
                    {row.task}
                  </td>
                  <td className="py-4 px-5 min-w-[240px]">
                    <div className="font-medium text-slate-900">{row.selectedMethod}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Compared against: {row.comparedAgainst}
                    </div>
                  </td>
                  <td className="py-4 px-5 min-w-[240px]">
                    <div className="text-slate-800">{row.peerReviewedSource}</div>
                    <div className="text-xs font-mono text-blue-700 mt-1">
                      {row.githubReference}
                    </div>
                  </td>
                  <td className="py-4 px-5 text-slate-700 min-w-[260px] leading-relaxed">
                    {audienceMode === 'toddler' ? row.toddlerSummary : row.biasAndLeakageControl}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
