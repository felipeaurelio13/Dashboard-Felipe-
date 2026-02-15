'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const categories = ['Payroll', 'Vendors', 'Cloud', 'Travel', 'Legal/Tax', 'Tools', 'Other'];

export default function VariancesPage() {
  const [week, setWeek] = useState(new Date().toISOString().slice(0,10));
  const [rows, setRows] = useState<any[]>([]);
  useEffect(()=>{supabase.from('opex_variances').select('*').eq('week_start',week).then(({data})=>setRows(data||[]));},[week]);
  const save = async () => { await supabase.from('opex_variances').upsert(rows, { onConflict: 'user_id,week_start,category' }); };
  return <section className="space-y-3"><h1 className="text-xl font-semibold">Variances OPEX</h1>{categories.map((cat)=>{const row=rows.find((r)=>r.category===cat)||{week_start:week,category:cat,actual:0,plan:0,driver:'other'};const variance=row.plan===0?0:((row.actual-row.plan)/row.plan)*100;const rag=Math.abs(variance)<=5?'green':Math.abs(variance)<=10?'yellow':'red';return <div className="card" key={cat}><div className="flex justify-between"><p>{cat}</p><p className="text-xs">{variance.toFixed(1)}% · {rag}</p></div><div className="grid grid-cols-2 gap-2"><input className="field" type="number" value={row.actual} onChange={(e)=>setRows([...rows.filter((r)=>r.category!==cat),{...row,actual:Number(e.target.value)}])}/><input className="field" type="number" value={row.plan} onChange={(e)=>setRows([...rows.filter((r)=>r.category!==cat),{...row,plan:Number(e.target.value)}])}/></div></div>;})}<button className="btn-primary w-full" onClick={save}>Guardar variances</button></section>;
}
