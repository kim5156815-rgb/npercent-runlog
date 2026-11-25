'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {Activity,Camera,ChartNoAxesCombined,Crown,Flag,LogOut,Timer,Trophy,Users,Settings2,Footprints} from 'lucide-react';
import {ResponsiveContainer,AreaChart,Area,XAxis,YAxis,Tooltip,CartesianGrid} from 'recharts';
import type {Board} from '@/lib/server';
import {metric,shift,type Category} from '@/lib/domain';
import {api,labels,message} from '@/lib/client';
import Brand from './Brand';
import Upload from './Upload';
const icons={growth:ChartNoAxesCombined,distance:Footprints,time:Timer};
export default function Dashboard({initial}:{initial:Board}){
 const [data,setData]=useState(initial),[tab,setTab]=useState<Category>('growth'),[token,setToken]=useState(''),[handle,setHandle]=useState(''),[members,setMembers]=useState<string[]>([]);
 const [id,setId]=useState(''),[pin,setPin]=useState(''),[err,setErr]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[upload,setUpload]=useState(false),[personal,setPersonal]=useState(false),[clock,setClock]=useState<number|null>(null);
 const auth=useRef<HTMLInputElement>(null),latest=useRef(0);
 const refresh=useCallback(async(t:string)=>{
  const seq=++latest.current;
  try{const r=await api<Board&{handle:string|null}>('board',t);
   if(seq!==latest.current)return;setData(r);setHandle(r.handle||'');setErr('');
  }catch(e){if(seq!==latest.current)return;if((e as {status?:number}).status===401){localStorage.removeItem('np-session');setToken('');setHandle('');setPersonal(false)}setErr(message(e))}
 },[]);
 useEffect(()=>{setToken(localStorage.getItem('np-session')||'');api<string[]>('members').then(setMembers).catch(e=>setErr(message(e)));setClock(Date.now());const it=setInterval(()=>setClock(Date.now()),1000);return()=>clearInterval(it)},[]);
 useEffect(()=>{void refresh(token);const timer=setInterval(()=>void refresh(token),15000);return()=>{clearInterval(timer);latest.current++}},[token,refresh]);
 async function join(e:React.FormEvent){
  e.preventDefault();setBusy(true);setErr('');
  try{const r=await api<{token:string;handle:string}>('auth','',{handle:id,pin});localStorage.setItem('np-session',r.token);setToken(r.token);setHandle(r.handle);setMembers(v=>[...new Set([...v,r.handle])]);setPin('');setUpload(true)}
  catch(e){setErr(message(e))}finally{setBusy(false)}
 }
 function open(){if(handle)setUpload(true);else{auth.current?.focus();auth.current?.scrollIntoView({block:'center',behavior:'smooth'})}}
 const {season,points,ranks}=data,rows=ranks[tab],left=clock===null?null:Math.max(0,Math.ceil((Date.parse(season.end+'T00:00:00+09:00')-clock)/1000));
 const dd=left===null?'…':Math.ceil(left/86400);
 const timer=left===null?'--:--:--':[Math.floor(left%86400/3600),Math.floor(left%3600/60),left%60].map(x=>String(x).padStart(2,'0')).join(':');
 const series=personal?'mine':'crew';
 return <main className="shell"><header><Brand/><a className="adminLink" href="/admin"><Settings2 size={16}/> 운영진</a></header>
 <section className="hero"><div className="heroCopy"><span className="live"><i/> {season.number}회차 진행 중</span><h1>CREW<br/><em>RUNLOG</em><span>.</span></h1><p>{season.start.replaceAll('-','.')} — {shift(season.end,-1).slice(5).replace('-','.')}</p></div></section>
 <div className="deadline"><span><Flag size={15}/> 시즌 종료까지</span><b>D-{dd}</b><time>{timer}</time></div>
 <div className="stats"><div><span><Activity/>누적 거리</span><b>{data.km.toFixed(1)}<small> km</small></b></div><div><span><Users/>참여 러너</span><b>{data.members}<small> 명</small></b></div><div><span><Flag/>러닝 인증</span><b>{data.count}<small> 회</small></b></div></div>
 <button className="primary capture" onClick={open}><Camera size={20}/> 러닝 기록 인증하기</button>
 {notice&&<p role="status" className="notice">{notice}</p>}
 <section id="rank"><div className="sectionHead"><h2><Trophy/> 시즌 랭킹</h2><small>14일 누적</small></div>
 <div className="tabs">{(Object.keys(labels) as Category[]).map(k=>{const I=icons[k];return <button key={k} aria-pressed={tab===k} onClick={()=>setTab(k)}><I size={16}/>{labels[k]}</button>})}</div>
 <p className="rule">{tab==='growth'?(season.number===1?'첫 회차는 러닝 인증 횟수로 집계합니다.':'성장률 순위 다음에 이전 기록이 없는 러너를 인증 횟수순으로 표시합니다.'):tab==='distance'?'이번 회차에 달린 거리를 합산합니다.':'이번 회차의 러닝 시간을 합산합니다.'}</p>
 <div className="ranklist">{rows.map((r,i)=><div className={'rank r'+(i+1)} key={r.handle}><span className="place">{i<3?<Crown size={20}/>:null}{String(i+1).padStart(2,'0')}</span><a href={'https://instagram.com/'+r.handle} target="_blank" rel="noopener noreferrer">@{r.handle}</a><strong>{metric(r,tab)}</strong></div>)}{!rows.length&&<p className="empty">첫 러닝 기록을 기다리고 있어요.</p>}</div></section>
 <section id="profile"><div className="sectionHead"><h2><Activity/> {personal?'나의':'크루'} N% 성장곡선</h2><small>누적 km</small></div>
 <div className="chart"><div className="chartHead"><b>{(points.at(-1)?.[series]??0).toFixed(2)} <small>km</small></b><div className="switch">{['크루','나'].map((x,i)=><button key={x} disabled={!!i&&!handle} aria-pressed={personal===!!i} onClick={()=>setPersonal(!!i)}>{x}</button>)}</div></div>
 <ResponsiveContainer width="100%" height={155}><AreaChart data={points} margin={{top:10,right:12,bottom:0,left:-20}}><CartesianGrid stroke="#344148" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="day" stroke="#a0abb6" fontSize={12} minTickGap={15}/><YAxis stroke="#a0abb6" fontSize={12}/><Tooltip contentStyle={{background:'#151e27',borderColor:'#344148'}}/><Area type="linear" dataKey={series} name="누적 거리 (km)" stroke="#a3e635" fill="#a3e635" fillOpacity={0.12} strokeWidth={3} isAnimationActive={false}/></AreaChart></ResponsiveContainer></div></section>
 <section id="join"><div className="sectionHead"><h2><Users/> 러너 프로필</h2></div>{handle?<div className="profile"><b>@{handle}</b><button onClick={async()=>{try{await api('logout',token,{});localStorage.removeItem('np-session');setToken('');setHandle('');setPersonal(false)}catch(e){setErr(message(e))}}}><LogOut size={15}/> 로그아웃</button></div>:<form onSubmit={join}><label>인스타그램 ID<input ref={auth} list="ids" placeholder="예: runwith_yuna" maxLength={30} pattern="[A-Za-z0-9._]{1,30}" value={id} onChange={e=>setId(e.target.value)} required/></label><datalist id="ids">{members.map(x=><option key={x} value={x}/>)}</datalist>
 <label>{members.includes(id.toLowerCase())?'내 PIN 입력':'참여 PIN (신규 ID는 처음 입력한 PIN으로 설정)'}<input type="password" inputMode="numeric" autoComplete="off" pattern="[0-9]{4}" maxLength={4} required value={pin} onChange={e=>setPin(e.target.value)} placeholder="숫자 4자리"/></label><button className="primary" disabled={busy}>참여하고 기록 인증</button></form>}{err&&<p role="alert">{err}</p>}</section>
 <footer>NPERCENT RUNNING CREW</footer>{upload&&<Upload token={token} start={season.start} close={()=>setUpload(false)} saved={()=>{setUpload(false);setNotice('러닝 기록을 등록했습니다.');void refresh(token)}}/>}</main>
}
