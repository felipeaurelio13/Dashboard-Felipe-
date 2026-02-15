'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LogsPage() {
  const [decision, setDecision] = useState('');
  const [risk, setRisk] = useState('');
  const [items, setItems] = useState<{ decisions: any[]; risks: any[] }>({ decisions: [], risks: [] });

  const load = async () => {
    const [d, r] = await Promise.all([supabase.from('decision_logs').select('*').order('date', { ascending: false }).limit(20), supabase.from('risk_logs').select('*').order('date', { ascending: false }).limit(20)]);
    setItems({ decisions: d.data ?? [], risks: r.data ?? [] });
  };
  useEffect(() => { load(); }, []);

  return <section className="space-y-3"><h1 className="text-xl font-semibold">Logs</h1><div className="card"><p>Nueva decisión</p><input className="field mt-2" value={decision} onChange={(e)=>setDecision(e.target.value)} /><button className="btn-primary mt-2 w-full" onClick={async()=>{await supabase.from('decision_logs').insert({date:new Date().toISOString().slice(0,10),decision,status:'open'});setDecision('');load();}}>Guardar</button></div><div className="card"><p>Nuevo riesgo</p><input className="field mt-2" value={risk} onChange={(e)=>setRisk(e.target.value)} /><button className="btn-primary mt-2 w-full" onClick={async()=>{await supabase.from('risk_logs').insert({date:new Date().toISOString().slice(0,10),risk,impact:2,probability:2,status:'open'});setRisk('');load();}}>Guardar</button></div><div className="card"><p className="font-medium">Decisiones</p>{items.decisions.length===0?<p className="text-sm">Sin decisiones aún. Usa Quick Add.</p>:items.decisions.map((d)=><p key={d.id} className="text-sm">• {d.decision}</p>)}</div><div className="card"><p className="font-medium">Riesgos</p>{items.risks.length===0?<p className="text-sm">Sin riesgos aún.</p>:items.risks.map((r)=><p key={r.id} className="text-sm">• {r.risk} (score {r.impact*r.probability})</p>)}</div><button className="fixed bottom-20 right-4 btn-primary rounded-full w-14 h-14 !min-h-0">+</button></section>;
}
