'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [form, setForm] = useState({ variance_green_pct: 5, variance_yellow_pct: 10, cash_warning_threshold: 0, default_currency: 'CLP', reminder_daily: false, reminder_weekly: false });
  const [status, setStatus] = useState('');
  useEffect(() => { supabase.from('user_settings').select('*').limit(1).then(({data})=>{if(data?.[0]) setForm(data[0]);}); }, []);
  const save = async () => {
    const { error } = await supabase.from('user_settings').upsert(form, { onConflict: 'user_id' });
    setStatus(error ? error.message : 'saved');
  };
  return <section className="space-y-3"><h1 className="text-xl font-semibold">Ajustes</h1><input className="field" type="number" value={form.variance_green_pct} onChange={(e)=>setForm({...form,variance_green_pct:Number(e.target.value)})}/><input className="field" type="number" value={form.variance_yellow_pct} onChange={(e)=>setForm({...form,variance_yellow_pct:Number(e.target.value)})}/><input className="field" type="number" value={form.cash_warning_threshold} onChange={(e)=>setForm({...form,cash_warning_threshold:Number(e.target.value)})}/><select className="field" value={form.default_currency} onChange={(e)=>setForm({...form,default_currency:e.target.value})}><option>CLP</option><option>USD</option></select><label className="card flex justify-between"><span>Reminder daily</span><input type="checkbox" checked={form.reminder_daily} onChange={(e)=>setForm({...form,reminder_daily:e.target.checked})}/></label><button className="btn-primary w-full" onClick={save}>Guardar ajustes</button><p>{status}</p></section>;
}
