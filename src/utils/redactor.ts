export interface RedactionReport {
  sanitizedText: string;
  removedItems: { category: string; count: number }[];
  isSafeForPublicRepo: boolean;
}

const PHONE_REGEX = /\b(?:\+?886[-\s]?|0)\d{1,3}[-\s]?\d{3,4}[-\s]?\d{3,4}\b/g;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const CONTACT_NAME_REGEX = /(?:聯絡人|Contact)\s*[:：]?\s*[\u4e00-\u9fff]{1,3}(?:先生|小姐|女士)/g;
const ADDRESS_REGEX = /新竹市[\u4e00-\u9fff0-9A-Za-z號樓室]+(?:\s*\([^)]*\))?/g;
const RAW_JOB_BANK_BOILERPLATE = /104人力銀行提醒您[\s\S]*/g;

export function redactSensitiveJobContent(rawInput: string): RedactionReport {
  let sanitized = rawInput;
  const removedItems: { category: string; count: number }[] = [];

  const trackAndReplace = (regex: RegExp, replacement: string, category: string) => {
    const matches = sanitized.match(regex);
    if (matches && matches.length > 0) {
      removedItems.push({ category, count: matches.length });
      sanitized = sanitized.replace(regex, replacement);
    }
  };

  trackAndReplace(RAW_JOB_BANK_BOILERPLATE, '[THIRD_PARTY_PORTAL_NOTICE_REMOVED]', 'Third-Party Portal Copyright Notice');
  trackAndReplace(CONTACT_NAME_REGEX, '[REDACTED_CONTACT_PERSON]', 'Personal Contact Name (PII)');
  trackAndReplace(PHONE_REGEX, '[REDACTED_PHONE]', 'Telephone Number (PII)');
  trackAndReplace(EMAIL_REGEX, '[REDACTED_EMAIL]', 'Email Address (PII)');
  trackAndReplace(ADDRESS_REGEX, '[REDACTED_FACILITY_ADDRESS]', 'Specific Street Address');

  const stillHasPhone = PHONE_REGEX.test(sanitized);
  const stillHasEmail = EMAIL_REGEX.test(sanitized);
  const stillHasChineseContact = /聯絡人/.test(sanitized) && !sanitized.includes('[REDACTED_CONTACT_PERSON]');

  return {
    sanitizedText: sanitized.trim(),
    removedItems,
    isSafeForPublicRepo: !stillHasPhone && !stillHasEmail && !stillHasChineseContact,
  };
}

export function buildCleanReadmeMarkdown(projectTitle: string, architectureSummary: string): string {
  return `# ${projectTitle}

> **Notice:** This repository contains original open-source reference code and peer-reviewed engineering notes only. All third-party job-board text, personal contact details, and proprietary employer materials have been excluded in compliance with Taiwan PDPA, Canada PIPEDA, Germany DSGVO/UrhG, and Japan APPI.

## Overview (Canadian English)
${architectureSummary}

## Verification & Governance
- **NIST CSF 2.0:** Aligned across Govern, Identify, Protect, Detect, Respond, and Recover.
- **License:** MIT (original reference scripts only).
`;
}
