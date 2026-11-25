export const DAY = 86400000;
export function today(now = Date.now()) { return new Date(now + 9 * 3600000).toISOString().slice(0,10); }
export function shift(day:string, n:number) { return new Date(Date.parse(day)+n*DAY).toISOString().slice(0,10); }
export function validDay(v:unknown): v is string {
 return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && shift(v,0)===v;
}
export function seasonFor(start:string, day:string) {
 const index=Math.floor((Date.parse(day)-Date.parse(start))/(14*DAY));
 return {number:index+1,start:shift(start,index*14),end:shift(start,(index+1)*14)};
}
export function duration(s:number) {
 return [Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(n=>String(n).padStart(2,'0')).join(':');
}
export function units(km:number) {
 const metres=Math.round(km*1000);
 return {metres,distanceBucket:Math.round(metres/100)};
}
export type Row={handle:string;metres:number;seconds:number;count:number;growth:number|null};
export type Category='growth'|'distance'|'time';
export function ranked(rows:Row[],key:Category) {
 const score=(r:Row)=>key==='distance'?r.metres:key==='time'?r.seconds:r.growth??r.count;
 return [...rows].sort((a,b)=>(key==='growth'?Number(a.growth===null)-Number(b.growth===null):0)||score(b)-score(a)||a.handle.localeCompare(b.handle,'en'));
}
export function metric(r:Row,k:Category) {
 if(k==='growth') return r.growth===null?r.count+'회':(r.growth>0?'+':'')+r.growth.toFixed(1)+'%';
 if(k==='distance') return (r.metres/1000).toFixed(2)+' km';
 return Math.floor(r.seconds/3600)+'시간 '+Math.floor(r.seconds%3600/60)+'분';
}
