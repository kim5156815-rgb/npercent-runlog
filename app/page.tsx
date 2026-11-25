import Dashboard from '@/components/Dashboard';
import {board} from '@/lib/server';
export const dynamic='force-dynamic';
export default async function Page(){return <Dashboard initial={await board()}/>}
