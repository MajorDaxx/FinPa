import { Routes } from '@angular/router';

import { App } from './app';
import { ResultComponent } from './results/result.component';

export const routes: Routes = [
  { path: '', component: App },
  { path: 'results', component: ResultComponent },
  { path: '**', redirectTo: '' }
];
