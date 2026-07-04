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
