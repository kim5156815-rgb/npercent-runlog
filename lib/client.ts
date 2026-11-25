export async function api<T>(action:string,token='',body?:object):Promise<T>{
 const form=body instanceof FormData;
 const r=await fetch('/api/'+action,{method:body?'POST':'GET',cache:'no-store',headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body&&!form?{'Content-Type':'application/json'}:{})},body:form?body:body?JSON.stringify(body):undefined});
 const data=await r.json().catch(()=>({}));
 if(!r.ok) throw Object.assign(new Error(data.error||'연결을 확인해 주세요.'),{status:r.status});
 return data;
}
export const labels={growth:'성장왕',distance:'거리왕',time:'시간왕'} as const;
export function message(e:unknown){return e instanceof Error?e.message:'연결을 확인해 주세요.'}
