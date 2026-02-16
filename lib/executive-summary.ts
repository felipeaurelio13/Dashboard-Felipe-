type ExecutiveSummaryInput = {
  cashToday: number;
  cash30d: number;
  blockersCount: number;
  risksCount: number;
  decisionsCount: number;
};

export type ExecutiveHealth = 'estable' | 'atencion' | 'critico';

export function getExecutiveSummary(input: ExecutiveSummaryInput) {
  const liquidityGap = input.cash30d - input.cashToday;
  const hasLiquidityRisk = input.cashToday <= 0 || input.cash30d <= 0;
  const highExecutionRisk = input.blockersCount >= 2 || input.risksCount >= 2;
  const lowDecisionsVelocity = input.decisionsCount === 0;

  const health: ExecutiveHealth = hasLiquidityRisk || (highExecutionRisk && lowDecisionsVelocity)
    ? 'critico'
    : highExecutionRisk || lowDecisionsVelocity
      ? 'atencion'
      : 'estable';

  const headline = health === 'critico'
    ? 'Prioridad máxima: protege caja y destraba ejecución.'
    : health === 'atencion'
      ? 'Hay señales de atención. Ajusta foco hoy.'
      : 'Operación estable para hoy. Mantén el ritmo.';

  return {
    health,
    headline,
    liquidityGap,
    completionScore: Math.max(0, Math.min(100, 100 - input.blockersCount * 15 - input.risksCount * 10 + input.decisionsCount * 8))
  };
}

