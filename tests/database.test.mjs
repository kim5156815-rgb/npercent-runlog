import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {units} from '../lib/domain.ts';

test('SQLite enforces duplicate buckets and permits another member or date',()=>{
 const db=new DatabaseSync(':memory:');
 try {
  db.exec(readFileSync(new URL('../prisma/migrations/20261125000000_init/migration.sql',import.meta.url),'utf8'));
  db.exec("INSERT INTO User VALUES ('a','runner_a','hash'),('b','runner_b','hash'); INSERT INTO Season VALUES(1,'2026-11-12','2026-11-26')");
  const insert=db.prepare('INSERT INTO RunRecord VALUES (?,?,?,?,?,?,?)');
  function save(id,user,day,km){
   const {metres,distanceBucket}=units(km);
   insert.run(id,user,1,day,metres,distanceBucket,1800);
  }
  save('1','a','2026-11-24',5.05);
  assert.throws(()=>save('2','a','2026-11-24',5.14),/UNIQUE/);
  save('3','b','2026-11-24',5.05);
  save('4','a','2026-11-25',5.05);
  assert.equal(db.prepare('SELECT count(*) AS n FROM RunRecord').get().n,3);
 } finally {db.close()}
});
