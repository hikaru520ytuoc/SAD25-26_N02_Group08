import assert from 'node:assert/strict';
import test from 'node:test';
import { canAccessFile } from '../../src/modules/files/policies/file-access.policy.ts';

const base = {
  ownerId: 'student-user',
  uploadedById: 'student-user',
  linkedUserIds: new Set(['student-user', 'supervisor-user', 'reviewer-user', 'council-user']),
  isArchiveFile: false,
};

test('file owner can access', () => {
  assert.equal(canAccessFile({ id: 'student-user', roles: ['STUDENT'] }, base), true);
});

test('related supervisor, reviewer and council member can access', () => {
  assert.equal(canAccessFile({ id: 'supervisor-user', roles: ['SUPERVISOR'] }, base), true);
  assert.equal(canAccessFile({ id: 'reviewer-user', roles: ['REVIEWER'] }, base), true);
  assert.equal(canAccessFile({ id: 'council-user', roles: ['COUNCIL_MEMBER'] }, base), true);
});

test('unrelated authenticated user is denied', () => {
  assert.equal(canAccessFile({ id: 'other-user', roles: ['STUDENT'] }, base), false);
});

test('faculty manager and admin follow global policy', () => {
  assert.equal(canAccessFile({ id: 'faculty-user', roles: ['FACULTY_MANAGER'] }, base), true);
  assert.equal(canAccessFile({ id: 'admin-user', roles: ['ADMIN'] }, base), true);
});

test('archive staff only gets role-wide access for linked archive files', () => {
  assert.equal(canAccessFile({ id: 'archive-user', roles: ['ARCHIVE_STAFF'] }, base), false);
  assert.equal(canAccessFile({ id: 'archive-user', roles: ['ARCHIVE_STAFF'] }, { ...base, isArchiveFile: true }), true);
});
