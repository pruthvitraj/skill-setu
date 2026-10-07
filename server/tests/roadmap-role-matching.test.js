const test = require('node:test');
const assert = require('node:assert/strict');
const { fallbackRoadmap } = require('../src/modules/roadmap/roadmap.ai');

const first = role => fallbackRoadmap({ skills: [] }, role).items[0].title;

test('Data Science receives the AI/data-science curriculum', () => {
  assert.match(first('Data Science'), /Mathematics/);
});

test('Build Engineer does not accidentally match UI', () => {
  assert.match(first('Build Engineer'), /Core Foundations/);
});

test('hyphenated frontend role matches frontend curriculum', () => {
  assert.match(first('Front-End Developer'), /JavaScript/);
});

test('specific backend role wins over broad Python keyword', () => {
  assert.match(first('Python Developer'), /Backend/);
});

test('Cloud Engineer does not accidentally match AI', () => {
  assert.match(first('Cloud Engineer'), /Linux/);
});

test('template topics do not claim verified gaps', () => {
  const roadmap = fallbackRoadmap({ skills: [] }, 'Frontend Engineer');
  assert.equal(roadmap.source, 'template');
  assert.ok(roadmap.gapAnalysis.every(topic => !topic.startsWith('Gap:')));
});
