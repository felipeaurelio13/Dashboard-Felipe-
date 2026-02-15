'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Row = { week_start: string; beginning_cash: number; inflow_sales: number; inflow_other: number; outflow_payroll: number; outflow_vendors: number; outflow_taxes: number; outflow_other: number; ending_cash?: number };

export default function ForecastPage() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => { supabase.from('cash_forecasts').select('*').order('week_start').limit(13).then(({data})=>setRows((data as Row[])||[])); }, []);
  const save = async () => { await supabase.from('cash_forecasts').upsert(rows, { onConflict: 'user_id,week_start' }); };
  return <section className="space-y-3"><h1 className="text-xl font-semibold">Cash forecast (13 semanas)</h1>{rows.length===0?<div className="card"><p>Sin datos. Crea la primera semana desde Supabase o agrega una fila en el código de carga inicial.</p></div>:rows.map((r,i)=><div key={r.week_start} className="card"><p>{r.week_start}</p><input className="field mt-2" type="number" value={r.beginning_cash} onChange={(e)=>{const next=[...rows];next[i].beginning_cash=Number(e.target.value);setRows(next);}} /><p className="text-sm mt-1">Ending: {r.ending_cash}</p></div>)}<button className="btn-primary w-full" onClick={save}>Guardar forecast</button></section>;
}
