'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const metrics = ['cash_end_week','runway_weeks','ar_overdue','revenue_mtd','revenue_ytd','gross_margin_pct','opex_mtd','ebitda_mtd','unreconciled_spend','tax_risks_open','projects_red_count','capacity_note'];

export default function WeekPage() {
  const weekStart = new Date().toISOString().slice(0, 10);
  const [rows, setRows] = useState<Record<string, { actual: number; plan: number }>>({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    supabase.from('weekly_metrics').select('*').eq('week_start', weekStart).then(({ data }) => {
      const next: Record<string, { actual: number; plan: number }> = {};
      for (const key of metrics) next[key] = { actual: 0, plan: 0 };
      data?.forEach((r) => { next[r.key] = { actual: Number(r.actual ?? 0), plan: Number(r.plan ?? 0) }; });
      setRows(next);
    });
  }, [weekStart]);

  const save = async () => {
    setStatus('saving...');
    const payload = metrics.map((key) => ({ week_start: weekStart, key, actual: rows[key]?.actual ?? 0, plan: rows[key]?.plan ?? 0 }));
    const { error } = await supabase.from('weekly_metrics').upsert(payload, { onConflict: 'user_id,week_start,key' });
    setStatus(error ? error.message : 'saved');
  };

  return <section className="space-y-3"><h1 className="text-xl font-semibold">Scoreboard semanal</h1>{metrics.map((m) => {const item=rows[m]??{actual:0,plan:0};const v=item.plan===0?0:Math.abs(((item.actual-item.plan)/item.plan)*100);const color=v<=5?'bg-emerald-400':v<=10?'bg-yellow-400':'bg-red-500';return <div className="card" key={m}><div className="flex justify-between"><p>{m}</p><span className={`status-dot ${color}`} /></div><div className="grid grid-cols-2 gap-2 mt-2"><input className="field" type="number" value={item.actual} onChange={(e)=>setRows({...rows,[m]:{...item,actual:Number(e.target.value)}})} /><input className="field" type="number" value={item.plan} onChange={(e)=>setRows({...rows,[m]:{...item,plan:Number(e.target.value)}})} /></div><p className="text-xs mt-1">Variancia {v.toFixed(1)}%</p></div>;})}<button className="btn-primary w-full" onClick={save}>Guardar semana</button><p>{status}</p></section>;
}
