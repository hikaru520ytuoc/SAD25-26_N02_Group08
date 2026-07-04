import assert from 'node:assert/strict';
import test from 'node:test';
import { parseVietnameseDate, toIsoDate, toVietnameseDate } from '../src/lib/vietnamese-date.ts';

test('accepts Vietnamese slash formats and normalizes them', () => {
  assert.equal(toVietnameseDate('02/07/2026'), '02/07/2026');
  assert.equal(toVietnameseDate('2/7/2026'), '02/07/2026');
});

test('accepts dash and ISO formats', () => {
  assert.equal(toVietnameseDate('02-07-2026'), '02/07/2026');
  assert.equal(toVietnameseDate('2026-07-02'), '02/07/2026');
});

test('converts the UI value to API ISO date', () => {
  assert.equal(toIsoDate('2/7/2026'), '2026-07-02');
});

test('rejects impossible or malformed dates', () => {
  assert.equal(parseVietnameseDate('31/02/2026'), null);
  assert.equal(parseVietnameseDate('07/2026'), null);
  assert.equal(toIsoDate('invalid'), '');
});
