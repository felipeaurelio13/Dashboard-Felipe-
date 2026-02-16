'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [form, setForm] = useState({ variance_green_pct: 5, variance_yellow_pct: 10, cash_warning_threshold: 0, default_currency: 'CLP', reminder_daily: false, reminder_weekly: false });
  const [status, setStatus] = useState('Personaliza umbrales para recibir alertas útiles.');

  useEffect(() => {
    supabase.from('user_settings').select('*').limit(1).then(({ data }) => {
      if (data?.[0]) setForm(data[0]);
    });
  }, []);

  const save = async () => {
    setStatus('Guardando ajustes...');
    const { error } = await supabase.from('user_settings').upsert(form, { onConflict: 'user_id' });
    setStatus(error ? error.message : 'Ajustes guardados.');
  };

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Ajustes</h1>

      <div className="card space-y-3">
        <label className="space-y-1">
          <span className="label">Umbral verde de variancia (%)</span>
          <input className="field" type="number" value={form.variance_green_pct} onChange={(e) => setForm({ ...form, variance_green_pct: Number(e.target.value) })} />
        </label>
        <label className="space-y-1">
          <span className="label">Umbral amarillo de variancia (%)</span>
          <input className="field" type="number" value={form.variance_yellow_pct} onChange={(e) => setForm({ ...form, variance_yellow_pct: Number(e.target.value) })} />
        </label>
        <label className="space-y-1">
          <span className="label">Alerta de caja mínima</span>
          <input className="field" type="number" value={form.cash_warning_threshold} onChange={(e) => setForm({ ...form, cash_warning_threshold: Number(e.target.value) })} />
        </label>
        <label className="space-y-1">
          <span className="label">Moneda por defecto</span>
          <select className="field" value={form.default_currency} onChange={(e) => setForm({ ...form, default_currency: e.target.value })}>
            <option>CLP</option>
            <option>USD</option>
          </select>
        </label>
      </div>

      <label className="card flex items-center justify-between gap-3">
        <span className="text-sm text-slate-100">Recordatorio diario</span>
        <input type="checkbox" checked={form.reminder_daily} onChange={(e) => setForm({ ...form, reminder_daily: e.target.checked })} />
      </label>

      <label className="card flex items-center justify-between gap-3">
        <span className="text-sm text-slate-100">Recordatorio semanal</span>
        <input type="checkbox" checked={form.reminder_weekly} onChange={(e) => setForm({ ...form, reminder_weekly: e.target.checked })} />
      </label>

      <button className="btn-primary w-full" onClick={save}>Guardar ajustes</button>
      <p aria-live="polite" className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-200">{status}</p>
    </section>
  );
}
