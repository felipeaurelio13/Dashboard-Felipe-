'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { dailySchema } from '@/lib/schemas';
import { enqueue } from '@/lib/outbox';
import { getExecutiveSummary } from '@/lib/executive-summary';
import { formatCurrency, parseAmountInput, parseListInput } from '@/lib/input-utils';

const INITIAL_STATUS = 'Completa los campos clave para una lectura ejecutiva rápida.';

export default function TodayPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ date: today, cash_today: '0', cash_30d: '0', critical_ar: '', blockers: '', risks: '', decisions: '' });
  const [status, setStatus] = useState(INITIAL_STATUS);

  useEffect(() => {
    supabase.from('daily_entries').select('*').eq('date', today).limit(1).then(({ data }) => {
      if (data?.[0]) {
        const d = data[0];
        setForm({
          date: today,
          cash_today: String(Number(d.cash_today ?? 0)),
          cash_30d: String(Number(d.cash_30d ?? 0)),
          critical_ar: d.critical_ar ?? '',
          blockers: (d.blockers ?? []).join('\n'),
          risks: (d.risks ?? []).join('\n'),
          decisions: (d.decisions ?? []).join('\n')
        });
      }
    });
  }, [today]);

  const cashToday = parseAmountInput(form.cash_today);
  const cash30d = parseAmountInput(form.cash_30d);

  const blockers = useMemo(() => parseListInput(form.blockers), [form.blockers]);
  const risks = useMemo(() => parseListInput(form.risks), [form.risks]);
  const decisions = useMemo(() => parseListInput(form.decisions), [form.decisions]);
  const summary = getExecutiveSummary({
    cashToday: Number.isFinite(cashToday) ? cashToday : 0,
    cash30d: Number.isFinite(cash30d) ? cash30d : 0,
    blockersCount: blockers.length,
    risksCount: risks.length,
    decisionsCount: decisions.length
  });

  const save = async () => {
    const parsed = dailySchema.safeParse({
      ...form,
      cash_today: cashToday,
      cash_30d: cash30d,
      blockers,
      risks,
      decisions
    });

    if (!parsed.success) {
      return setStatus(parsed.error.issues[0].message);
    }

    setStatus('Guardando reporte diario...');

    const payload = parsed.data;
    if (!navigator.onLine) {
      await enqueue({ id: crypto.randomUUID(), table: 'daily_entries', action: 'upsert', payload, retries: 0, createdAt: Date.now() });
      return setStatus('Sin internet: reporte guardado en cola para sincronizar automáticamente.');
    }

    const { error } = await supabase.from('daily_entries').upsert(payload, { onConflict: 'user_id,date' });
    setStatus(error ? error.message : 'Reporte diario guardado correctamente.');

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
        <h1 className="text-xl font-semibold">Hoy · Panel ejecutivo</h1>
        <p className="text-sm text-slate-300">Registra solo lo esencial para decidir rápido y gestionar con precisión.</p>
      </header>

      <div className="card space-y-2" role="status" aria-live="polite">
        <p className="text-xs uppercase tracking-wide text-slate-400">Resumen automático</p>
        <p className="text-sm font-medium text-slate-100">{summary.headline}</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
          <p>Estado: <span className="font-semibold capitalize text-slate-100">{summary.health}</span></p>
          <p>Cobertura 30d: <span className="font-semibold text-slate-100">{summary.liquidityGap.toLocaleString('es-CL')}</span></p>
          <p>Bloqueos: <span className="font-semibold text-slate-100">{blockers.length}</span></p>
          <p>Score de ejecución: <span className="font-semibold text-slate-100">{summary.completionScore}%</span></p>
        </div>
      </div>

      <div className="card space-y-3">
        <label className="space-y-1">
          <span className="label">Caja hoy</span>
          <input
            className="field"
            type="text"
            inputMode="decimal"
            enterKeyHint="next"
            autoComplete="off"
            value={form.cash_today}
            onChange={(e) => setForm({ ...form, cash_today: e.target.value })}
            placeholder="Ej: 1.500.000"
            aria-describedby="cash-today-help"
          />
          <p id="cash-today-help" className="text-xs text-slate-400">Monto disponible hoy. Vista rápida: {Number.isFinite(cashToday) ? formatCurrency(cashToday) : 'Ingresa un número válido'}.</p>
        </label>
        <label className="space-y-1">
          <span className="label">Caja proyectada a 30 días</span>
          <input
            className="field"
            type="text"
            inputMode="decimal"
            enterKeyHint="next"
            autoComplete="off"
            value={form.cash_30d}
            onChange={(e) => setForm({ ...form, cash_30d: e.target.value })}
            placeholder="Ej: 5.200.000"
            aria-describedby="cash-30d-help"
          />
          <p id="cash-30d-help" className="text-xs text-slate-400">Proyección de liquidez. Vista rápida: {Number.isFinite(cash30d) ? formatCurrency(cash30d) : 'Ingresa un número válido'}.</p>
        </label>
        <label className="space-y-1">
          <span className="label">Cobros críticos</span>
          <textarea className="field min-h-20" value={form.critical_ar} onChange={(e) => setForm({ ...form, critical_ar: e.target.value })} placeholder="Cliente A — lunes\nCliente B — jueves" />
          <p className="text-xs text-slate-400">Usa una línea por cobro para facilitar lectura del equipo ejecutivo.</p>
        </label>
      </div>

      <div className="card space-y-3">
        <label className="space-y-1">
          <span className="label">Bloqueos activos</span>
          <textarea className="field min-h-20" value={form.blockers} onChange={(e) => setForm({ ...form, blockers: e.target.value })} placeholder="Escribe uno por línea o separado por coma" />
          <p className="text-xs text-slate-400">Detectados: {blockers.length}.</p>
        </label>
        <label className="space-y-1">
          <span className="label">Riesgos activos</span>
          <textarea className="field min-h-20" value={form.risks} onChange={(e) => setForm({ ...form, risks: e.target.value })} placeholder="Escribe uno por línea o separado por coma" />
          <p className="text-xs text-slate-400">Detectados: {risks.length}.</p>
        </label>
        <label className="space-y-1">
          <span className="label">Decisiones tomadas hoy</span>
          <textarea className="field min-h-20" value={form.decisions} onChange={(e) => setForm({ ...form, decisions: e.target.value })} placeholder="Escribe una decisión por línea o separado por coma" />
          <p className="text-xs text-slate-400">Registradas: {decisions.length}.</p>
        </label>
      </div>

      <button className="btn-primary w-full" onClick={save}>Registrar reporte diario</button>
      <p aria-live="polite" className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-200">{status}</p>
    </section>
  );
}
