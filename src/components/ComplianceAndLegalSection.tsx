import React, { useState } from 'react';
import {
  AudienceMode,
  LEGAL_JURISDICTIONS,
  NIST_CSF_CONTROLS,
} from '../data/engineeringData';
import { redactSensitiveJobContent } from '../utils/redactor';

interface ComplianceAndLegalSectionProps {
  audienceMode: AudienceMode;
  checkedControls: Record<string, boolean>;
  onToggleControl: (id: string) => void;
}

const DEFAULT_SAMPLE_TEXT = `演算法工程師(PD0150) - CDSP/TNR/WDR/AI-SR/Thermal/Compiler
上班地點: 新竹市新竹科學工業園區力行一路1號3樓A2 (新竹科學園區)
聯絡人: 周小姐
104人力銀行提醒您 求職安全專線 0800-085-151 02-29126104`;

export const ComplianceAndLegalSection: React.FC<ComplianceAndLegalSectionProps> = ({
  audienceMode,
  checkedControls,
  onToggleControl,
}) => {
  const [rawInput, setRawInput] = useState<string>(DEFAULT_SAMPLE_TEXT);
  const redaction = redactSensitiveJobContent(rawInput);

  const completedCount = NIST_CSF_CONTROLS.filter((c) => checkedControls[c.id]).length;

  return (
    <div className="space-y-12">
      <section id="nist-csf" aria-labelledby="nist-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500">
              04. NIST Cybersecurity Framework 2.0 Implementation
            </p>
            <h2 id="nist-heading" className="text-2xl font-semibold text-slate-900 mt-1">
              NIST CSF 2.0 Engineering Controls
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              {audienceMode === 'toddler'
                ? 'Six safety steps—make rules, label boxes, lock secrets, watch for leaks, clean up spills, and keep a spare flashlight!'
                : 'End-to-end security governance across training data, model weights, compiler artifacts, and public GitHub repositories.'}
            </p>
          </div>
          <div className="text-xs font-mono text-slate-700 tabular-nums shrink-0">
            Verified controls: {completedCount} / {NIST_CSF_CONTROLS.length}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {NIST_CSF_CONTROLS.map((ctrl) => {
            const checked = Boolean(checkedControls[ctrl.id]);
            return (
              <label
                key={ctrl.id}
                className="flex flex-col justify-between bg-white border border-slate-200 rounded-xl p-5 cursor-pointer hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-900">
                      {ctrl.functionName}
                    </span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleControl(ctrl.id)}
                      aria-label={`Mark ${ctrl.functionName} control verified`}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{ctrl.controlGoal}</p>
                  <p className="text-sm text-slate-700 mt-3 leading-relaxed">
                    {audienceMode === 'toddler' ? ctrl.toddlerAction : ctrl.pd0150Action}
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-500 mt-4">
                  {checked ? '● Control Checked' : '○ Pending Review'}
                </div>
              </label>
            );
          })}
        </div>
      </section>

      <section id="github-legal" aria-labelledby="legal-heading" className="space-y-6">
        <div>
          <p className="text-xs font-medium text-slate-500">
            05. Cross-Border Publishing & Privacy Compliance
          </p>
          <h2 id="legal-heading" className="text-2xl font-semibold text-slate-900 mt-1">
            GitHub Legal Readiness (Taiwan · Canada · Germany · Japan)
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            {audienceMode === 'toddler'
              ? 'We do not have a GitHub key here, and we must never share a real person’s name or copy a website without asking. Test the clean-up box below first!'
              : 'Direct GitHub push is disabled in this environment (no user OAuth/PAT credentials). Before pushing manually, verify compliance across all four jurisdictions and scrub third-party PII.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LEGAL_JURISDICTIONS.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-sm font-semibold text-slate-900">{item.jurisdiction}</div>
              <div className="text-xs text-slate-500 mt-1">{item.statutes}</div>
              <p className="text-sm text-slate-700 mt-3 leading-relaxed">
                {audienceMode === 'toddler' ? item.toddlerRule : item.keyRequirementForGithub}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Pre-Commit PII & Third-Party Text Redactor
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically strips personal contact names, phone numbers, addresses, and job-portal boilerplate before creating a README.
              </p>
            </div>
            <span
              className={`text-xs font-semibold ${
                redaction.isSafeForPublicRepo ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {redaction.isSafeForPublicRepo
                ? '● Clean for Public Repo'
                : '✖ Contains Unredacted PII'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label htmlFor="raw-job-text" className="block text-xs font-medium text-slate-700 mb-1.5">
                Raw Input Text (Check Before Commit)
              </label>
              <textarea
                id="raw-job-text"
                rows={5}
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label htmlFor="sanitized-output" className="block text-xs font-medium text-slate-700 mb-1.5">
                Sanitized Output Preview
              </label>
              <textarea
                id="sanitized-output"
                rows={5}
                readOnly
                value={redaction.sanitizedText}
                className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              />
            </div>
          </div>

          {redaction.removedItems.length > 0 && (
            <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
              <span className="font-semibold text-slate-800">Redacted items:</span>
              {redaction.removedItems.map((entry) => (
                <span key={entry.category} className="font-mono tabular-nums">
                  {entry.category} ({entry.count})
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
