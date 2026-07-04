import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

test('login form starts empty and does not expose demo credentials', () => {
  const source = read('src/app/login/page.tsx');
  assert.match(source, /email:\s*''/);
  assert.match(source, /password:\s*''/);
  assert.doesNotMatch(source, /demoAccounts|Admin@123456|Tài khoản demo/);
});

test('file actions request signed access URLs instead of opening protected API routes', () => {
  const actions = read('src/components/common/file-actions.tsx');
  const service = read('src/services/files.service.ts');
  assert.match(actions, /getFileAccessUrl/);
  assert.match(service, /access-url/);
  assert.doesNotMatch(actions, /\/api\/files\/.*\/download/);
});

test('Vietnamese date field keeps the visible input as text', () => {
  const source = read('src/components/common/vietnamese-date-input.tsx');
  assert.match(source, /placeholder=.*dd\/MM\/yyyy/);
  assert.match(source, /type="date"/);
  assert.match(source, /opacity-0/);
});

test('supervisor assignment pages tolerate incomplete or wrapped API payloads', () => {
  const service = read('src/services/supervisor-assignments.service.ts');
  const page = read('src/app/faculty/supervisor-assignments/page.tsx');
  const table = read('src/components/sprint3/supervisor-assignment-table.tsx');

  assert.match(service, /normalizeAssignments/);
  assert.match(service, /Array\.isArray\(payload\)/);
  assert.match(page, /validItems/);
  assert.match(table, /selected\.student\?\.major/);
});

test('application routes have a recoverable error boundary', () => {
  const source = read('src/app/error.tsx');
  assert.match(source, /reset/);
  assert.match(source, /Thử tải lại/);
});
