import { Injectable } from '@angular/core';
import { PlannerAssumptions, PlannerFormModel, SavingsPlanSummary } from '../models/finance.models';

/**
 * FinanceCalculatorService encapsulates financial math.
 * This is the Controller/Service logic, independent from the View.
 */
@Injectable({ providedIn: 'root' })
export class FinanceCalculatorService {
  /**
   * Compute years to retirement.
   */
  yearsToRetirement(model: Pick<PlannerFormModel, 'age' | 'retirementAge'>): number {
    return Math.max(0, (model.retirementAge ?? 0) - (model.age ?? 0));
  }

  /**
   * Present value of an annuity with monthly payments R, monthly rate i, n months.
   * Returns needed capital to sustain payment R for n months.
   */
  neededCapitalAtRetirement(pensionNeedPerMonth: number, annualRealReturnRate: number, yearsInRetirement: number): number {
    const i = (annualRealReturnRate ?? 0) / 12;
    const n = Math.max(1, Math.round(yearsInRetirement * 12));
    if (i <= 0) {
      return Math.max(0, pensionNeedPerMonth * n);
    }
    return Math.max(0, pensionNeedPerMonth * (1 - Math.pow(1 + i, -n)) / i);
  }

  /**
   * Solve for required monthly savings payment to reach target future value
   * given current savings growing at monthly rate r over m months.
   */
  requiredMonthlySavings(targetFutureValue: number, currentSavings: number, monthlyRate: number, months: number): number {
    const fvCurrent = (currentSavings ?? 0) * Math.pow(1 + monthlyRate, months);
    const numerator = Math.max(0, targetFutureValue - fvCurrent);
    if (months <= 0) return numerator; // show gap if no time left
    if (monthlyRate <= 0) return numerator / months;
    return numerator * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
  }

  /**
   * Full summary computation using assumptions.
   */
  summarize(model: PlannerFormModel, assumptions: PlannerAssumptions): SavingsPlanSummary {
    const years = this.yearsToRetirement({ age: model.age, retirementAge: model.retirementAge });
    const yearsInRetirement = Math.max(1, (assumptions.lifeExpectancy ?? 0) - (model.retirementAge ?? 0));
    const neededCap = this.neededCapitalAtRetirement(model.pensionNeed, assumptions.realReturnRate, yearsInRetirement);
    const r = (assumptions.realReturnRate ?? 0) / 12;
    const m = Math.max(0, years * 12);
    const monthlyRequiredSavings = this.requiredMonthlySavings(neededCap, model.currentSavings ?? 0, r, m);
    return {
      yearsToRetirement: years,
      neededCapitalAtRetirement: neededCap,
      monthlyRequiredSavings: Math.max(0, monthlyRequiredSavings)
    };
  }
}
