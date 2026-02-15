'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { dealSchema } from '@/lib/schemas';

export default function PipelinePage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [form, setForm] = useState({ customer: '', amount: 0, probability: 50, stage: 'Lead', next_step: '', close_date: '' });
  const [error, setError] = useState('');
  const load = () => supabase.from('pipeline_deals').select('*').order('created_at', { ascending: false }).then(({data})=>setDeals(data||[]));
  useEffect(() => { void load(); }, []);

  const save = async () => {
    const parsed = dealSchema.safeParse(form);
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    await supabase.from('pipeline_deals').insert(parsed.data);
    setForm({ customer: '', amount: 0, probability: 50, stage: 'Lead', next_step: '', close_date: '' });
    setError('');
    load();
  };

  const total = deals.reduce((a,d)=>a+Number(d.amount||0),0);
  const weighted = deals.reduce((a,d)=>a+(Number(d.amount||0)*Number(d.probability||0))/100,0);

  return <section className="space-y-3"><h1 className="text-xl font-semibold">Pipeline</h1><div className="card space-y-2"><input className="field" placeholder="Cliente" value={form.customer} onChange={(e)=>setForm({...form,customer:e.target.value})}/><input className="field" type="number" placeholder="Monto" value={form.amount} onChange={(e)=>setForm({...form,amount:Number(e.target.value)})}/><input className="field" type="range" min={0} max={100} value={form.probability} onChange={(e)=>setForm({...form,probability:Number(e.target.value)})}/><select className="field" value={form.stage} onChange={(e)=>setForm({...form,stage:e.target.value})}><option>Lead</option><option>Qualified</option><option>Proposal</option><option>Negotiation</option><option>Closed</option></select><input className="field" placeholder="Next step" value={form.next_step} onChange={(e)=>setForm({...form,next_step:e.target.value})}/><input className="field" type="date" value={form.close_date} onChange={(e)=>setForm({...form,close_date:e.target.value})}/><button className="btn-primary w-full" onClick={save}>Agregar deal</button>{error&&<p role="alert">{error}</p>}</div><div className="card"><p>Total: {total}</p><p>Weighted: {weighted}</p></div></section>;
}
