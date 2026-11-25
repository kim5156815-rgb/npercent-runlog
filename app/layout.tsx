import './globals.css';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'N% 런로그 | 엔퍼센트 러닝크루',description:'14일간의 러닝 기록과 엔퍼센트 크루 랭킹'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}
