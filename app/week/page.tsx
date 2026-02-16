'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const metrics = [
  { key: 'cash_end_week', label: 'Caja fin de semana' },
  { key: 'runway_weeks', label: 'Runway (semanas)' },
  { key: 'ar_overdue', label: 'Cuentas por cobrar vencidas' },
  { key: 'revenue_mtd', label: 'Ingresos MTD' },
  { key: 'revenue_ytd', label: 'Ingresos YTD' },
  { key: 'gross_margin_pct', label: 'Margen bruto %' },
  { key: 'opex_mtd', label: 'OPEX MTD' },
  { key: 'ebitda_mtd', label: 'EBITDA MTD' },
  { key: 'unreconciled_spend', label: 'Gasto sin conciliación' },
  { key: 'tax_risks_open', label: 'Riesgos tributarios abiertos' },
  { key: 'projects_red_count', label: 'Proyectos en rojo' },
  { key: 'capacity_note', label: 'Capacidad (nota)' }
];

export default function WeekPage() {
  const weekStart = new Date().toISOString().slice(0, 10);
  const [rows, setRows] = useState<Record<string, { actual: number; plan: number }>>({});
  const [status, setStatus] = useState('Actualiza métricas clave para evaluar desviaciones.');

  useEffect(() => {
    supabase.from('weekly_metrics').select('*').eq('week_start', weekStart).then(({ data }) => {
      const next: Record<string, { actual: number; plan: number }> = {};
      for (const metric of metrics) next[metric.key] = { actual: 0, plan: 0 };
      data?.forEach((r) => { next[r.key] = { actual: Number(r.actual ?? 0), plan: Number(r.plan ?? 0) }; });
      setRows(next);
    });
  }, [weekStart]);

  const save = async () => {
    setStatus('Guardando semana...');
    const payload = metrics.map((metric) => ({ week_start: weekStart, key: metric.key, actual: rows[metric.key]?.actual ?? 0, plan: rows[metric.key]?.plan ?? 0 }));
    const { error } = await supabase.from('weekly_metrics').upsert(payload, { onConflict: 'user_id,week_start,key' });
    setStatus(error ? error.message : 'Semana guardada correctamente.');
  };

  return (
    <section className="space-y-3">
      <h1 className="text-xl font-semibold">Scoreboard semanal</h1>
      <p className="text-sm text-slate-300">Verde ≤ 5%, amarillo ≤ 10%, rojo {'>'} 10% de variación.</p>
      {metrics.map((metric) => {
        const item = rows[metric.key] ?? { actual: 0, plan: 0 };
        const variance = item.plan === 0 ? 0 : Math.abs(((item.actual - item.plan) / item.plan) * 100);
        const color = variance <= 5 ? 'bg-emerald-400' : variance <= 10 ? 'bg-yellow-400' : 'bg-red-500';

        return (
          <div className="card" key={metric.key}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-100">{metric.label}</p>
              <span className={`status-dot ${color}`} />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="space-y-1">
                <span className="label">Actual</span>
                <input className="field" type="number" value={item.actual} onChange={(e) => setRows({ ...rows, [metric.key]: { ...item, actual: Number(e.target.value) } })} />
              </label>
              <label className="space-y-1">
                <span className="label">Plan</span>
                <input className="field" type="number" value={item.plan} onChange={(e) => setRows({ ...rows, [metric.key]: { ...item, plan: Number(e.target.value) } })} />
              </label>
            </div>
            <p className="mt-2 text-xs text-slate-300">Variancia {variance.toFixed(1)}%</p>
          </div>
        );
      })}
      <button className="btn-primary w-full" onClick={save}>Guardar semana</button>
      <p aria-live="polite" className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-200">{status}</p>
    </section>
  );
}
