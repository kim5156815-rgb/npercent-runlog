'use client';
import {useEffect,useState} from 'react';
import {Gift,Crown,Lock,LogOut} from 'lucide-react';
import type {Board} from '@/lib/server';
import {api,labels,message} from '@/lib/client';
import {metric,shift,type Category} from '@/lib/domain';
import Brand from '@/components/Brand';
type Results=Board&{active:number;seasons:number[]};
export default function Admin(){
 const [token,setToken]=useState(''),[pass,setPass]=useState(''),[data,setData]=useState<Results|null>(null),[error,setError]=useState(''),[n,setN]=useState(1),[rolling,setRolling]=useState(false),[slot,setSlot]=useState(''),[winners,setWinners]=useState<string[]>([]),[busy,setBusy]=useState(false);
 const [selected,setSelected]=useState('');
 useEffect(()=>setToken(sessionStorage.getItem('np-admin')||''),[]);
 useEffect(()=>{if(!token)return;let alive=true;
 async function update(){try{const d=await api<Results>('results'+(selected?'?season='+selected:''),token);if(alive)setData(d)}catch(e){if(!alive)return;setError(message(e));if((e as {status?:number}).status===401){sessionStorage.removeItem('np-admin');setToken('');setData(null)}}}
 void update();const timer=setInterval(update,15000);return()=>{alive=false;clearInterval(timer)}},[token,selected]);
 useEffect(()=>{setWinners([])},[data?.season.number]);
 const pool=data?.ranks.distance.filter(x=>x.count>=3)??[];
 async function lottery(){
  setRolling(true);setWinners([]);setError('');
  const interval=setInterval(()=>setSlot(pool[Math.floor(Math.random()*pool.length)]?.handle||''),90);
  try{const [r]=await Promise.all([api<{winners:string[]}>('draw',token,{count:n}),new Promise<void>(resolve=>setTimeout(resolve,1400))]);setWinners(r.winners)}
  catch(e){setError(message(e))}finally{clearInterval(interval);setRolling(false)}
 }
 return <main className="shell"><header><Brand/><a href="/" className="adminLink">크루 홈</a></header><section><span className="kicker">CREW CONTROL</span><h1 className="adminTitle">운영진 대시보드</h1></section>
 {error&&<p role="alert">{error}</p>}{!data?<form onSubmit={async e=>{e.preventDefault();setBusy(true);try{const r=await api<{token:string}>('admin-auth','',{password:pass});sessionStorage.setItem('np-admin',r.token);setToken(r.token);setPass('');setError('')}catch(e){setError(message(e))}finally{setBusy(false)}}}><label>관리자 비밀번호<input type="password" required value={pass} onChange={e=>setPass(e.target.value)}/></label><button disabled={busy} className="primary"><Lock size={16}/> 운영진 입장</button></form>:<>
 <label>결과 회차<select value={selected} disabled={rolling} onChange={e=>setSelected(e.target.value)}><option value="">현재 회차</option>{data.seasons.filter(x=>x!==data.active).map(x=><option key={x} value={x}>{x}회차 · 종료</option>)}</select></label>
 <div className="share"><Brand/><p className="kicker">SEASON RESULTS</p><h2>{data.season.number}회차 결과</h2><p>{data.season.start} — {shift(data.season.end,-1)}</p>{(Object.keys(labels) as Category[]).map(k=><div className="result" key={k}><h3><Crown size={17}/> {labels[k]}</h3><table><caption className="sr-only">{labels[k]} 상위 3명</caption><tbody>{data.ranks[k].slice(0,3).map((r,i)=><tr key={r.handle}><td>{i+1}위</td><td>@{r.handle}</td><td>{metric(r,k)}</td></tr>)}</tbody></table>{!data.ranks[k].length&&<small>아직 기록이 없습니다.</small>}</div>)}</div><p className="rule">{data.active===data.season.number?"진행 중인 회차의 실시간 집계입니다.":"종료된 회차의 최종 결과입니다."} 위 카드를 캡처해 공유하세요.</p>
 {!selected&&<section><h2><Gift/> 행운상 추첨</h2><p className="rule">이번 회차 3회 이상 인증한 러너 {pool.length}명</p><label>당첨 인원<select value={n} disabled={rolling} onChange={e=>setN(Number(e.target.value))}>{[1,2,3].map(x=><option key={x} disabled={x>pool.length} value={x}>{x}명</option>)}</select></label><div className={'slot '+(rolling?'running':'')} aria-live="polite">{rolling?'@'+slot:winners.length?winners.map(x=><b key={x}>@{x}</b>):'추첨 대기'}</div><button className="primary" disabled={rolling||n>pool.length} onClick={lottery}><Gift size={18}/>{rolling?'추첨 중…':'행운상 추첨하기'}</button></section>}
 <button className="adminLink" disabled={rolling} onClick={async()=>{try{await api('logout',token,{admin:true});sessionStorage.removeItem('np-admin');setToken('');setData(null);setWinners([])}catch(e){setError(message(e))}}}><LogOut size={15}/> 로그아웃</button></>}</main>
}
