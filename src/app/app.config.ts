import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { PLANNER_DEFAULTS, PlannerDefaultsConfig } from './core/tokens/planner.config';

const defaults: PlannerDefaultsConfig = {
  defaultHousing: 900,
  defaultFood: 350,
  retirementAgeDefault: 67,
  realReturnRate: 0.04,
  lifeExpectancy: 90,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: PLANNER_DEFAULTS, useValue: defaults }
  ]
};
