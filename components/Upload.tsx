'use client';
import {useRef,useState,useEffect} from 'react';
import {X,ImagePlus,LoaderCircle} from 'lucide-react';
import {api,message} from '@/lib/client';
import {today} from '@/lib/domain';
type Props={token:string;start:string;close:()=>void;saved:()=>void};
export default function Upload({token,start,close,saved}:Props){
 const dialog=useRef<HTMLDialogElement>(null),input=useRef<HTMLInputElement>(null);
 const [edit,setEdit]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[demo,setDemo]=useState(false);
 const [day,setDay]=useState(today()),[km,setKm]=useState(''),[time,setTime]=useState(''),[name,setName]=useState('');
 useEffect(()=>{const d=dialog.current;d?.showModal();return()=>d?.close()},[]);
 async function load(file?:File){
  if(!file||busy)return;setError('');setName(file.name);setBusy(true);setDemo(false);
  try{const data=new FormData();data.set('image',file);
   const v=await api<{day:string|null;km:number|null;time:string|null;demo:boolean}>('analyze-run',token,data);
   setDay(v.day??'');setKm(v.km?.toString()??'');setTime(v.time??'');setDemo(v.demo);setEdit(true);
  }catch(e){setError(message(e));setEdit(true)}finally{setBusy(false)}
 }
 async function submit(e:React.FormEvent){e.preventDefault();setError('');setBusy(true);
  try{const [h,m,s]=time.split(':').map(Number);await api('runs',token,{day,km:Number(km),seconds:h*3600+m*60+s});saved()}
  catch(e){setError(message(e))}finally{setBusy(false)}
 }
 return <dialog ref={dialog} onCancel={close} aria-labelledby="upload-title"><div className="sectionHead"><h2 id="upload-title">러닝 기록 인증</h2><button className="icon" onClick={close} aria-label="닫기"><X/></button></div>
 <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={e=>load(e.target.files?.[0])}/>
 <button className="drop" disabled={busy} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();load(e.dataTransfer.files[0])}} onClick={()=>input.current?.click()}>
 {busy?<LoaderCircle className="spin"/>:<ImagePlus/>}<b>{busy?'처리 중…':name||'러닝 앱 캡처 선택'}</b><small>이미지를 끌어 놓거나 갤러리에서 선택 · 최대 8 MB</small></button>
 {error&&<p role="alert">{error}</p>}
 {edit?<form onSubmit={submit}>{demo&&<p className="notice">테스트 모드의 예시 수치입니다. 실제 기록으로 수정해 주세요.</p>}
 <label>러닝 날짜<input required type="date" min={start} max={today()} value={day} onChange={e=>setDay(e.target.value)}/></label>
 <label>거리 (km)<input required type="number" step=".01" min=".01" max="1000" value={km} onChange={e=>setKm(e.target.value)}/></label>
 <label>운동 시간 (시:분:초)<input required pattern="[0-9]{2,3}:[0-5][0-9]:[0-5][0-9]" placeholder="00:32:10" value={time} onChange={e=>setTime(e.target.value)}/></label>
 <button className="primary" disabled={busy}>기록 등록하기</button></form>:null}</dialog>
}
