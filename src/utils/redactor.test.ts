import test from 'node:test';
import assert from 'node:assert/strict';
import { redactSensitiveJobContent, buildCleanReadmeMarkdown } from './redactor';

test('redactSensitiveJobContent strips contact names, phone numbers, and portal notices', () => {
  const sample = `
上班地點: 新竹市新竹科學工業園區力行一路1號3樓A2 (新竹科學園區)
聯絡人 周小姐
104人力銀行提醒您 求職安全專線 0800-085-151 02-29126104
`;
  const report = redactSensitiveJobContent(sample);
  assert.equal(report.isSafeForPublicRepo, true);
  assert.ok(!report.sanitizedText.includes('周小姐'));
  assert.ok(!report.sanitizedText.includes('0800-085-151'));
  assert.ok(!report.sanitizedText.includes('104人力銀行提醒您'));
  assert.ok(report.removedItems.length >= 3);
});

test('buildCleanReadmeMarkdown omits PII and keeps Canadian English notice', () => {
  const md = buildCleanReadmeMarkdown('PD0150 Reference', 'Clean pipeline summary.');
  assert.match(md, /PDPA/);
  assert.match(md, /PIPEDA/);
  assert.match(md, /DSGVO/);
  assert.match(md, /APPI/);
});
