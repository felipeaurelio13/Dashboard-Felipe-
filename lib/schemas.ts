import { z } from 'zod';

export const moneySchema = z.coerce.number().finite();

export const dailySchema = z.object({
  date: z.string().min(1),
  cash_today: moneySchema,
  cash_30d: moneySchema,
  critical_ar: z.string().max(280).optional(),
  blockers: z.array(z.string().min(1)).default([]),
  risks: z.array(z.string().min(1)).default([]),
  decisions: z.array(z.string().min(1)).default([])
});

export const dealSchema = z.object({
  customer: z.string().min(1),
  amount: moneySchema,
  probability: z.coerce.number().min(0).max(100),
  stage: z.string().min(1),
  next_step: z.string().optional(),
  close_date: z.string().optional()
}).superRefine((v, ctx) => {
  const requiresNext = ['Qualified', 'Proposal', 'Negotiation'];
  if (requiresNext.includes(v.stage) && !v.next_step) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Next step es obligatorio desde Qualified.' });
  }
});

export type DailyInput = z.infer<typeof dailySchema>;
