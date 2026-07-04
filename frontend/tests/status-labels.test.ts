import assert from 'node:assert/strict';
import test from 'node:test';
import { getStatusMeta } from '../src/lib/status-labels.ts';

test('maps workflow enums to Vietnamese labels', () => {
  assert.equal(getStatusMeta('PENDING_FACULTY').label, 'Chờ Khoa xử lý');
  assert.equal(getStatusMeta('OFFICIALLY_ASSIGNED').label, 'Đã chốt đề tài & GVHD');
  assert.equal(getStatusMeta('LOCKED').label, 'Đã khóa');
});

test('does not expose unknown raw enum values', () => {
  assert.equal(getStatusMeta('SOME_NEW_BACKEND_ENUM').label, 'Trạng thái chưa được ánh xạ');
});
