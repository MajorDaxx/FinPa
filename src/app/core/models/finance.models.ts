/**
 * Domain model interfaces for the financial planner.
 * Keeping models in a dedicated file clarifies the "Model" part of MVC.
 */

export type Gender = 'Female' | 'Male' | 'Diverse';

export interface PersonalInfo {
  age: number;
  gender: Gender | null;
  industry: string | null;
  retirementAge: number;
}

export interface IncomeAndGoals {
  netIncome: number;
  pensionNeed: number; // target monthly need in retirement (real)
  currentSavings: number; // current invested capital
}

export interface FixedCosts {
  housing: number;
  food: number;
}

export interface PlannerFormModel extends PersonalInfo, IncomeAndGoals, FixedCosts {}

export interface PlannerAssumptions {
  realReturnRate: number; // annual real rate, e.g. 0.04
  lifeExpectancy: number; // e.g. 90
}

export interface SavingsPlanSummary {
  yearsToRetirement: number;
  neededCapitalAtRetirement: number;
  monthlyRequiredSavings: number;
}
