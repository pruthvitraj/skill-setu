const test = require('node:test');
const assert = require('node:assert/strict');
const { validateGeneratedRoadmap } = require('../src/modules/roadmap/roadmap.ai');

function fixture() {
  return {
    summary: 'Suggested learning path.',
    gapAnalysis: ['Suggested JavaScript topics'],
    items: Array.from({ length: 5 }, (_, index) => ({
      title: `Stage ${index + 1}`,
      description: 'Study and practise the stated learning objectives.',
      phase: index + 1,
      type: 'practice',
    })),
  };
}

test('valid AI roadmap is normalized and completion cannot be injected', () => {
  const input = fixture();
  input.items[0].completed = true;
  input.items[0].resourceId = 'injected';
  const result = validateGeneratedRoadmap(input);
  assert.equal(result.source, 'ai');
  assert.equal(result.items[0].completed, false);
  assert.equal(result.items[0].resourceId, undefined);
});

test('invalid item type is rejected', () => {
  const input = fixture();
  input.items[0].type = 'terminal';
  assert.equal(validateGeneratedRoadmap(input), null);
});

test('missing title is rejected', () => {
  const input = fixture();
  delete input.items[0].title;
  assert.equal(validateGeneratedRoadmap(input), null);
});

test('invalid and out-of-order phases are rejected', () => {
  for (const phase of [0, 6, 1.5, '1']) {
    const input = fixture();
    input.items[0].phase = phase;
    assert.equal(validateGeneratedRoadmap(input), null);
  }
  const input = fixture();
  input.items.reverse();
  assert.equal(validateGeneratedRoadmap(input), null);
});

test('missing phases and excessive content are rejected', () => {
  const input = fixture();
  input.items.pop();
  assert.equal(validateGeneratedRoadmap(input), null);
  const oversized = fixture();
  oversized.summary = 'x'.repeat(2001);
  assert.equal(validateGeneratedRoadmap(oversized), null);
});

test('malformed AI response is rejected', () => {
  for (const input of [null, {}, [], 'invalid']) {
    assert.equal(validateGeneratedRoadmap(input), null);
  }
});
