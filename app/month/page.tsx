'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const tasks = ['bank_reconcile','cards_reconcile','ap_completeness','accruals_provisions','revenue_recognition','fx_reval','tax_review','variance_review','close_pack_final','signoff'];

export default function MonthPage() {
  const month = new Date().toISOString().slice(0, 7);
  const [rows, setRows] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from('close_tasks').select('*').eq('month_key', month).then(({ data }) => {
      const next: Record<string, string> = {};
      tasks.forEach((t) => (next[t] = 'todo'));
      data?.forEach((d) => (next[d.task_key] = d.status));
      setRows(next);
    });
  }, [month]);

  const save = async () => {
    const payload = tasks.map((task_key) => ({ month_key: month, task_key, status: rows[task_key] || 'todo' }));
    await supabase.from('close_tasks').upsert(payload, { onConflict: 'user_id,month_key,task_key' });
  };

  return <section className="space-y-3"><h1 className="text-xl font-semibold">Close checklist</h1>{tasks.map((t)=><div key={t} className="card"><p>{t}</p><select className="field mt-2" value={rows[t]??'todo'} onChange={(e)=>setRows({...rows,[t]:e.target.value})}><option value="todo">Todo</option><option value="doing">Doing</option><option value="done">Done</option></select></div>)}<button onClick={save} className="btn-primary w-full">Guardar cierre</button></section>;
}
