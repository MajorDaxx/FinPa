import { Injectable, inject } from '@angular/core';
import { PlannerAssumptions, PlannerFormModel } from '../models/finance.models';
import { PLANNER_DEFAULTS } from '../tokens/planner.config';

export interface PlannerSnapshot {
  model: PlannerFormModel;
  assumptions: PlannerAssumptions;
}

@Injectable({ providedIn: 'root' })
export class PlannerStateService {
  private defaults = inject(PLANNER_DEFAULTS);
  private snapshot?: PlannerSnapshot;

  set(model: PlannerFormModel, assumptions: PlannerAssumptions) {
    this.snapshot = { model, assumptions };
  }

  get(): PlannerSnapshot {
    if (this.snapshot) return this.snapshot;
    // Fallback minimal default snapshot
    return {
      model: {
        age: 30,
        gender: 'Female',
        industry: 'General',
        netIncome: 3500,
        retirementAge: this.defaults.retirementAgeDefault,
        pensionNeed: 2000,
        housing: this.defaults.defaultHousing,
        food: this.defaults.defaultFood,
        currentSavings: 0,
      },
      assumptions: {
        realReturnRate: this.defaults.realReturnRate,
        lifeExpectancy: this.defaults.lifeExpectancy,
      }
    };
  }
}
