import { FinanceCalculatorService } from './finance-calculator.service';

describe('FinanceCalculatorService', () => {
  let svc: FinanceCalculatorService;

  beforeEach(() => {
    svc = new FinanceCalculatorService();
  });

  it('computes years to retirement', () => {
    expect(svc.yearsToRetirement({ age: 30, retirementAge: 67 })).toBe(37);
    expect(svc.yearsToRetirement({ age: 70, retirementAge: 67 })).toBe(0);
  });

  it('needed capital with zero rate is linear', () => {
    const cap = svc.neededCapitalAtRetirement(2000, 0, 25);
    expect(cap).toBe(2000 * 25 * 12);
  });

  it('required monthly savings for zero rate equals gap/months', () => {
    const months = 10 * 12;
    const target = 120000;
    const current = 0;
    const r = 0;
    const pay = svc.requiredMonthlySavings(target, current, r, months);
    expect(Math.round(pay)).toBe(Math.round(target / months));
  });

  it('summary integrates pieces and clamps to non-negative', () => {
    const summary = svc.summarize(
      { age: 30, gender: 'Female', industry: 'General', retirementAge: 67, netIncome: 3500, pensionNeed: 2000, housing: 900, food: 350, currentSavings: 0 },
      { realReturnRate: 0.04, lifeExpectancy: 90 }
    );
    expect(summary.yearsToRetirement).toBe(37);
    expect(summary.neededCapitalAtRetirement).toBeGreaterThan(0);
    expect(summary.monthlyRequiredSavings).toBeGreaterThan(0);
  });
});
