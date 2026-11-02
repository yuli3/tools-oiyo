import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('Korean insurance screening exposes unmodeled requirements without definitive retention claims',()=>{
 const s=fs.readFileSync('dist/ko/health-insurance-calculator/index.html','utf8');
 for(const text of ['배우자','형제자매','1.8억','주택임대소득','nhis.or.kr/nhis/policy/wbhada07400m01.do','현재 입력만으로 피부양자 자격을 확정하지 않아요'])assert.ok(s.includes(text),text);
 assert.ok(!s.includes('현재 건강보험 피부양자 자격을 유지할 수 있어요.'));
});
