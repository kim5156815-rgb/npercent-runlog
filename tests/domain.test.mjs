import test from 'node:test';
import assert from 'node:assert/strict';
import {today,shift,seasonFor,validDay,units,duration,ranked,metric} from '../lib/domain.ts';
test('Korean midnight starts the next day and the next fortnight',()=>{
 const start='2026-11-12';
 assert.equal(today(Date.parse('2026-11-25T14:59:59Z')),'2026-11-25');
 assert.equal(today(Date.parse('2026-11-25T15:00:00Z')),'2026-11-26');
 assert.deepEqual(seasonFor(start,shift(start,14)),{number:2,start:'2026-11-26',end:'2026-12-10'});
 assert.equal(seasonFor(start,shift(start,13)).number,1);
});
test('impossible dates are rejected',()=>{assert.equal(validDay('2026-02-29'),false);assert.equal(validDay('2028-02-29'),true)});
test('duplicate buckets round to a tenth kilometre using metres',()=>{
 assert.equal(units(5.05).distanceBucket,units(5.14).distanceBucket);
 assert.notEqual(units(5.04).distanceBucket,units(5.05).distanceBucket);
});
const row=(handle,count,growth,metres=1000,seconds=3600)=>({handle,count,growth,metres,seconds});
test('first season uses verification count with stable ties',()=>{
 assert.deepEqual(ranked([row('z',3,null),row('a',3,null),row('b',4,null)],'growth').map(r=>r.handle),['b','a','z']);
});
test('growth percentages and newcomer counts retain separate units',()=>{
 const rows=[row('new',10,null),row('up',1,30),row('down',1,-5)];
 assert.deepEqual(ranked(rows,'growth').map(r=>r.handle),['up','down','new']);assert.equal(metric(rows[0],'growth'),'10회');
});
test('time and distance rank independently',()=>{
 const a=row('a',1,null,4000,4000),b=row('b',1,null,5000,3000);
 assert.equal(ranked([a,b],'distance')[0],b);assert.equal(ranked([a,b],'time')[0],a);
 assert.equal(duration(3661),'01:01:01');
});
