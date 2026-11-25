import {PrismaClient} from '@prisma/client';
import {randomBytes,createHash,scryptSync,timingSafeEqual,randomInt} from 'node:crypto';
import {today,shift,validDay,seasonFor,ranked,type Row} from './domain';
const scope=globalThis as typeof globalThis & {npdb?:PrismaClient};
export const db=scope.npdb??=new PrismaClient();
export class Fault extends Error { constructor(public status:number,message:string){super(message)} }
export function fail(status:number,message:string):never {throw new Fault(status,message)}
export function hashPin(pin:string,salt=randomBytes(16).toString('hex')) {return salt+'.'+scryptSync(pin,salt,32).toString('hex')}
export function equal(a:string,b:string){return timingSafeEqual(digest(a),digest(b))}
function digest(s:string){return createHash('sha256').update(s).digest()}
export async function issue(userId:string|null,admin=false){
 const token=randomBytes(32).toString('hex');
 await db.session.create({data:{digest:digest(token).toString('hex'),userId,admin,expires:new Date(Date.now()+(admin?8:24*30)*3600000)}});
 return token;
}
export async function session(req:Request,admin=false){
 const token=req.headers.get('authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
 const s=token&&await db.session.findUnique({where:{digest:digest(token).toString('hex')},include:{user:true}});
 if(!s||s.expires.getTime()<=Date.now()||s.admin!==admin) return fail(401,'인증이 필요합니다.');
 return s;
}
const attempts=new Map<string,{count:number,end:number}>();
export function limit(key:string,max:number){
 const now=Date.now();
 if(attempts.size>2000) for(const [k,v] of attempts) if(v.end<=now) attempts.delete(k);
 const entry=attempts.get(key);
 if(!entry||entry.end<=now) attempts.set(key,{count:1,end:now+600000});
 else if(++entry.count>max) fail(429,'요청이 많습니다. 10분 후 다시 시도해 주세요.');
}
export async function current(){
 const day=today();
 let first=await db.season.findUnique({where:{number:1}});
 if(!first){
  const start=process.env.SEASON_START||shift(day,-6);
  if(!validDay(start)||start>day) fail(500,'시즌 시작일 설정을 확인해 주세요.');
  first=await db.season.upsert({where:{number:1},create:seasonFor(start,start),update:{}});
 }
 const w=seasonFor(first.start,day);
 return db.season.upsert({where:{number:w.number},create:w,update:{}});
}
export async function board(handle?:string,selected?:number){
 const season=selected===undefined?await current():await db.season.findUnique({where:{number:selected}});
 if(!season) return fail(404,'회차를 찾을 수 없습니다.');
 const runs=await db.runRecord.findMany({where:{seasonNumber:{in:[season.number,season.number-1]}},include:{user:{select:{handle:true}}}});
 const prev=new Map<string,number>(), rows=new Map<string,Row>();
 const curve=Array.from({length:14},(_,i)=>({day:shift(season.start,i),crew:0,mine:0}));
 for(const r of runs){
  const id=r.user.handle;
  if(r.seasonNumber!==season.number){prev.set(id,(prev.get(id)||0)+r.metres);continue}
  const row=rows.get(id)??{handle:id,metres:0,seconds:0,count:0,growth:null};
  row.metres+=r.metres;row.seconds+=r.seconds;row.count++;rows.set(id,row);
  const p=curve.find(x=>x.day===r.day);
  if(p){p.crew+=r.metres;if(handle===id)p.mine+=r.metres}
 }
 for(const r of rows.values()){const old=prev.get(r.handle);if(old)r.growth=100*(r.metres-old)/old}
 let crew=0,mine=0;
 const points=curve.filter(p=>p.day<=today()).map(p=>({day:p.day.slice(5),crew:(crew+=p.crew)/1000,mine:(mine+=p.mine)/1000}));
 const list=[...rows.values()];
 return {season,points,km:crew/1000,count:list.reduce((s,r)=>s+r.count,0),members:list.length,
 ranks:{growth:ranked(list,'growth'),distance:ranked(list,'distance'),time:ranked(list,'time')}};
}
export type Board=Awaited<ReturnType<typeof board>>;
export function draw<T>(pool:T[],n:number){const copy=[...pool];return Array.from({length:n},()=>copy.splice(randomInt(copy.length),1)[0])}
