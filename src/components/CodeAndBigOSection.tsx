import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { AudienceMode, CODE_TABS } from '../data/engineeringData';

interface CodeAndBigOSectionProps {
  audienceMode: AudienceMode;
}

export const CodeAndBigOSection: React.FC<CodeAndBigOSectionProps> = ({ audienceMode }) => {
  const [activeTabId, setActiveTabId] = useState<'pytorch' | 'opencv' | 'tflite'>('pytorch');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeTab = CODE_TABS.find((t) => t.id === activeTabId) ?? CODE_TABS[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeTab.code);
      setCopiedId(activeTab.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <section id="code-bigo" aria-labelledby="code-bigo-heading" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            02. Official PyTorch, OpenCV & TensorFlow Reference Implementations
          </p>
          <h2 id="code-bigo-heading" className="text-2xl font-semibold text-slate-900 mt-1">
            Leak-Free Python Code & Big-O Complexity
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            {audienceMode === 'toddler'
              ? 'Clean recipes written straight from the official instruction books, using fixed-size bowls so the computer never runs out of desk space.'
              : 'Implemented strictly from official framework APIs without dynamic graph retention, per-frame heap allocations, or @tf.function retracing leaks.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          {CODE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabId(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTabId === tab.id
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
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-900">Official Source: </span>
            {activeTab.officialDocSource}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
          >
            {copiedId === activeTab.id ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                Copy Python
              </>
            )}
          </button>
        </div>

        <div className="p-5 bg-slate-950 text-slate-100 overflow-x-auto">
          <pre className="text-xs leading-relaxed font-mono">
            <code>{activeTab.code}</code>
          </pre>
        </div>

        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50/60">
          <p className="text-xs font-semibold text-slate-900">
            Memory-Leak & Performance Guardrail
          </p>
          <p className="text-sm text-slate-700 mt-1">
            {audienceMode === 'toddler' ? activeTab.toddlerSummary : activeTab.leakGuardrail}
          </p>
        </div>

        <div className="overflow-x-auto border-t border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-5">Function</th>
                <th className="py-3 px-5">Time Complexity</th>
                <th className="py-3 px-5">Space Complexity</th>
                <th className="py-3 px-5">Architectural Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {activeTab.complexityRows.map((row) => (
                <tr key={row.fnName} className="align-top">
                  <td className="py-3 px-5 font-mono font-semibold text-slate-900 whitespace-nowrap">
                    {row.fnName}
                  </td>
                  <td className="py-3 px-5 font-mono text-blue-700 whitespace-nowrap tabular-nums">
                    {row.timeComplexity}
                  </td>
                  <td className="py-3 px-5 font-mono text-slate-800 whitespace-nowrap tabular-nums">
                    {row.spaceComplexity}
                  </td>
                  <td className="py-3 px-5 text-slate-600 leading-relaxed">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
