import { InjectionToken } from '@angular/core';

export interface PlannerDefaultsConfig {
  defaultHousing: number;
  defaultFood: number;
  retirementAgeDefault: number;
  realReturnRate: number;
  lifeExpectancy: number;
}

export const PLANNER_DEFAULTS = new InjectionToken<PlannerDefaultsConfig>('PLANNER_DEFAULTS');
