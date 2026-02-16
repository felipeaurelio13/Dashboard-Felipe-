'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { dailySchema } from '@/lib/schemas';
import { enqueue } from '@/lib/outbox';

export default function TodayPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ date: today, cash_today: 0, cash_30d: 0, critical_ar: '', blockers: '', risks: '', decisions: '' });
  const [status, setStatus] = useState('Completa los campos clave y guarda.');

  useEffect(() => {
    supabase.from('daily_entries').select('*').eq('date', today).limit(1).then(({ data }) => {
      if (data?.[0]) {
        const d = data[0];
        setForm({
          date: today,
          cash_today: Number(d.cash_today ?? 0),
          cash_30d: Number(d.cash_30d ?? 0),
          critical_ar: d.critical_ar ?? '',
          blockers: (d.blockers ?? []).join(', '),
          risks: (d.risks ?? []).join(', '),
          decisions: (d.decisions ?? []).join(', ')
        });
      }
    });
  }, [today]);

  const save = async () => {
    const parsed = dailySchema.safeParse({
      ...form,
      blockers: form.blockers ? form.blockers.split(',').map((s) => s.trim()).filter(Boolean) : [],
      risks: form.risks ? form.risks.split(',').map((s) => s.trim()).filter(Boolean) : [],
      decisions: form.decisions ? form.decisions.split(',').map((s) => s.trim()).filter(Boolean) : []
    });

    if (!parsed.success) return setStatus(parsed.error.issues[0].message);
    setStatus('Guardando...');

    const payload = parsed.data;
    if (!navigator.onLine) {
      await enqueue({ id: crypto.randomUUID(), table: 'daily_entries', action: 'upsert', payload, retries: 0, createdAt: Date.now() });
      return setStatus('Sin internet: cambios guardados en cola.');
    }

    const { error } = await supabase.from('daily_entries').upsert(payload, { onConflict: 'user_id,date' });
    setStatus(error ? error.message : 'Registro guardado correctamente.');

    if (!error && payload.decisions.length) {
      await Promise.all(payload.decisions.map((decision) => supabase.from('decision_logs').insert({ date: payload.date, decision })));
    }
    if (!error && payload.risks.length) {
      await Promise.all(payload.risks.map((risk) => supabase.from('risk_logs').insert({ date: payload.date, risk, impact: 2, probability: 2 })));
    }
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Hoy · Semáforo 10</h1>
        <p className="text-sm text-slate-300">Enfócate en caja, riesgos y decisiones para tener claridad inmediata.</p>
      </header>

      <div className="card space-y-3">
        <label className="space-y-1">
          <span className="label">Caja hoy</span>
          <input className="field" type="number" inputMode="decimal" value={form.cash_today} onChange={(e) => setForm({ ...form, cash_today: Number(e.target.value) })} placeholder="Ej: 1500000" />
        </label>
        <label className="space-y-1">
          <span className="label">Caja proyectada 30 días</span>
          <input className="field" type="number" inputMode="decimal" value={form.cash_30d} onChange={(e) => setForm({ ...form, cash_30d: Number(e.target.value) })} placeholder="Ej: 5200000" />
        </label>
        <label className="space-y-1">
          <span className="label">Cobros críticos</span>
          <input className="field" value={form.critical_ar} onChange={(e) => setForm({ ...form, critical_ar: e.target.value })} placeholder="Cliente A lunes, Cliente B jueves" />
        </label>
      </div>

      <div className="card space-y-3">
        <label className="space-y-1">
          <span className="label">Bloqueos de hoy</span>
          <input className="field" value={form.blockers} onChange={(e) => setForm({ ...form, blockers: e.target.value })} placeholder="Proveedor, aprobación, etc. (separado por coma)" />
        </label>
        <label className="space-y-1">
          <span className="label">Riesgos activos</span>
          <input className="field" value={form.risks} onChange={(e) => setForm({ ...form, risks: e.target.value })} placeholder="Riesgo 1, Riesgo 2" />
        </label>
        <label className="space-y-1">
          <span className="label">Decisiones tomadas</span>
          <input className="field" value={form.decisions} onChange={(e) => setForm({ ...form, decisions: e.target.value })} placeholder="Decisión 1, Decisión 2" />
        </label>
      </div>

      <button className="btn-primary w-full" onClick={save}>Registrar</button>
      <p aria-live="polite" className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-200">{status}</p>
    </section>
  );
}
