'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ProjectsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [client, setClient] = useState('');
  const load = () => supabase.from('projects').select('*').order('created_at',{ascending:false}).then(({data})=>setRows(data||[]));
  useEffect(() => { void load(); }, []);
  return <section className="space-y-3"><h1 className="text-xl font-semibold">Project health</h1><div className="card"><input className="field" value={client} onChange={(e)=>setClient(e.target.value)} placeholder="Cliente"/><button className="btn-primary w-full mt-2" onClick={async()=>{if(!client)return;await supabase.from('projects').insert({client,status:'green'});setClient('');load();}}>Crear proyecto</button></div><div className="card"><p className="font-medium">Red projects</p>{rows.filter(r=>r.status==='red').length===0?<p className="text-sm">No hay proyectos en rojo.</p>:rows.filter(r=>r.status==='red').map(r=><p key={r.id}>• {r.client}</p>)}</div></section>;
}
