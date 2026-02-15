'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { dailySchema } from '@/lib/schemas';
import { enqueue } from '@/lib/outbox';

export default function TodayPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ date: today, cash_today: 0, cash_30d: 0, critical_ar: '', blockers: '', risks: '', decisions: '' });
  const [status, setStatus] = useState('');

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
    setStatus('saving...');

    const payload = parsed.data;
    if (!navigator.onLine) {
      await enqueue({ id: crypto.randomUUID(), table: 'daily_entries', action: 'upsert', payload, retries: 0, createdAt: Date.now() });
      return setStatus('offline: guardado en cola');
    }

    const { error } = await supabase.from('daily_entries').upsert(payload, { onConflict: 'user_id,date' });
    setStatus(error ? error.message : 'saved');

    if (!error && payload.decisions.length) {
      await Promise.all(payload.decisions.map((decision) => supabase.from('decision_logs').insert({ date: payload.date, decision })));
    }
    if (!error && payload.risks.length) {
      await Promise.all(payload.risks.map((risk) => supabase.from('risk_logs').insert({ date: payload.date, risk, impact: 2, probability: 2 })));
    }
  };

  return (
    <section className="space-y-3">
      <h1 className="text-xl font-semibold">Hoy · Semáforo 10</h1>
      <input className="field" type="number" inputMode="decimal" value={form.cash_today} onChange={(e) => setForm({ ...form, cash_today: Number(e.target.value) })} placeholder="Caja hoy" />
      <input className="field" type="number" inputMode="decimal" value={form.cash_30d} onChange={(e) => setForm({ ...form, cash_30d: Number(e.target.value) })} placeholder="Caja 30 días" />
      <input className="field" value={form.critical_ar} onChange={(e) => setForm({ ...form, critical_ar: e.target.value })} placeholder="Cobros críticos" />
      <input className="field" value={form.blockers} onChange={(e) => setForm({ ...form, blockers: e.target.value })} placeholder="Bloqueos (coma separada)" />
      <input className="field" value={form.risks} onChange={(e) => setForm({ ...form, risks: e.target.value })} placeholder="Riesgos (coma separada)" />
      <input className="field" value={form.decisions} onChange={(e) => setForm({ ...form, decisions: e.target.value })} placeholder="Decisiones (coma separada)" />
      <button className="btn-primary w-full" onClick={save}>Registrar</button>
      <p aria-live="polite" className="text-sm text-slate-300">{status}</p>
    </section>
  );
}
