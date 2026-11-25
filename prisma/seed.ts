import 'dotenv/config';
import {current,db,hashPin} from '../lib/server';
import {today,shift,units} from '../lib/domain';
async function seed(){
 const season=await current();
 const handles=['pace.jin','runwith_yuna','seoul.strider','min_42k','river.runner'];
 for(const [i,handle] of handles.entries()){
  const user=await db.user.upsert({where:{handle},create:{handle,pinHash:hashPin('2580')},update:{}});
  for(let j=0;j<[5,4,3,2,1][i];j++){
   const day=shift(season.start,Math.min(j,Math.round((Date.parse(today())-Date.parse(season.start))/86400000)));
   const distance=units(4+i*0.75+j*1.33);
   await db.runRecord.upsert({where:{userId_day_distanceBucket:{userId:user.id,day,distanceBucket:distance.distanceBucket}},
   create:{...distance,day,seasonNumber:season.number,userId:user.id,seconds:Math.round(distance.metres*(0.30+i*0.014))},update:{}});
  }
 }
}
seed().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>db.$disconnect());
