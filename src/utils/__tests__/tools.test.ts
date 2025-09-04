import {
  allocateMonthlyBudget,
  predictEndOfMonthBalance,
  compoundInterest,
  loanMonthlyPayment,
  categoryPercentages,
} from '../tools';

describe('tools utils', () => {
  test('allocateMonthlyBudget returns saving and byCategory', () => {
    const r = allocateMonthlyBudget(10000000, 0.2, {
      A: 0.5,
      B: 0.5,
    });
    expect(Math.round(r.saving)).toBe(2000000);
    expect(Math.round(r.spending)).toBe(8000000);
    expect(Math.round(r.byCategory.A)).toBe(4000000);
    expect(Math.round(r.byCategory.B)).toBe(4000000);
  });

  test('predictEndOfMonthBalance basic calc', () => {
    const end = predictEndOfMonthBalance(5000000, 200000, 10, 0);
    // 5,000,000 - 2,000,000 = 3,000,000
    expect(end).toBe(3000000);
  });

  test('compoundInterest grows principal', () => {
    const v = compoundInterest(10000000, 0.12, 12, 1, 0);
    expect(v).toBeGreaterThan(10000000);
  });

  test('loanMonthlyPayment positive', () => {
    const m = loanMonthlyPayment(50000000, 0.12, 24);
    expect(m).toBeGreaterThan(0);
  });

  test('categoryPercentages sums to ~1', () => {
    const pct = categoryPercentages([
      { id: '1', amount: 100, category: 'A', note: '', date: '', createdAt: '' },
      { id: '2', amount: 100, category: 'B', note: '', date: '', createdAt: '' },
    ] as any);
    const sum = Object.values(pct).reduce((s, v) => s + v, 0);
    expect(Math.round(sum * 100)).toBe(100);
  });
});
