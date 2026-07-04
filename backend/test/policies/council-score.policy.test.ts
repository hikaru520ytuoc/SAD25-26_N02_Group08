import assert from 'node:assert/strict';
import test from 'node:test';
import { isCouncilScoreLocked } from '../../src/modules/scores/policies/council-score.policy.ts';

test('council score stays editable before the session is completed', () => {
  assert.equal(isCouncilScoreLocked(null), false);
  assert.equal(isCouncilScoreLocked('NOT_STARTED'), false);
  assert.equal(isCouncilScoreLocked('IN_PROGRESS'), false);
});

test('council score is locked after session completion', () => {
  assert.equal(isCouncilScoreLocked('COMPLETED'), true);
});
