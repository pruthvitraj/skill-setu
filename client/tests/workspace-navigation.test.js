import test from 'node:test';
import assert from 'node:assert/strict';
import { workspaceNavigation, isWorkspaceItemActive } from '../src/layouts/workspaceNavigation.js';
test('editor and detail routes highlight their parent without matching similarly named paths', () => {
  const jobs = workspaceNavigation.recruiter.flatMap(([,items]) => items).find(item => item.path === '/company/jobs');
  for (const path of ['/company/jobs', '/company/jobs/new', '/company/jobs/owned', '/company/jobs/owned/edit']) assert.equal(isWorkspaceItemActive(jobs,path),true);
  for (const path of ['/company/jobs-other', '/student/marketplace', '/company/applications']) assert.equal(isWorkspaceItemActive(jobs,path),false);
  const students = workspaceNavigation.tpo.flatMap(([,items]) => items).find(item => item.path === '/tpo/students');
  assert.equal(isWorkspaceItemActive(students,'/tpo/students/owned'),true);
});
test('supported TPO aliases highlight exactly one canonical item', () => {
  const items=workspaceNavigation.tpo.flatMap(([,items])=>items);
  for (const [alias,canonical] of [['/tpo/drives','/tpo/placement-drives'],['/tpo/analytics','/tpo/placement-analytics']]) {
    assert.deepEqual(items.filter(item=>isWorkspaceItemActive(item,alias)).map(item=>item.path),[canonical]);
  }
});
test('every role retains notifications and settings without duplicate destinations', () => {
  for(const [role,groups] of Object.entries(workspaceNavigation)) {
    const paths=groups.flatMap(([,items])=>items.map(item=>item.path));
    const prefix=role==='recruiter'?'company':role;
    assert.ok(paths.includes(`/${prefix}/notifications`)); assert.ok(paths.includes(`/${prefix}/settings`));
    assert.equal(new Set(paths).size,paths.length);
  }
});
