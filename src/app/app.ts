import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PersonalGroupComponent } from './groups/personal/personal-group.component';
import { IncomeGroupComponent } from './groups/income/income-group.component';
import { FixedCostGroupComponent } from './groups/fixed/fixed-cost-group.component';
import { ResultInlineComponent } from './results/result-inline.component';
import { MatStepperModule } from '@angular/material/stepper';
import { FinanceCalculatorService } from './core/services/finance-calculator.service';
import { PlannerAssumptions, PlannerFormModel } from './core/models/finance.models';
import { PLANNER_DEFAULTS } from './core/tokens/planner.config';
import { PlannerStateService } from './core/services/planner-state.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatSliderModule, MatIconModule, MatButtonModule, MatStepperModule, PersonalGroupComponent, IncomeGroupComponent, FixedCostGroupComponent, ResultInlineComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  steps: Array<'personal'|'income'|'fixed'> = ['personal','income','fixed'];
  activeGroup = signal<'personal' | 'income' | 'fixed'>('personal');
  skipped = new Set<'personal'|'income'|'fixed'>();

  get selectedIndex() { return this.steps.indexOf(this.activeGroup()); }
  setGroup(group: 'personal' | 'income' | 'fixed') { this.activeGroup.set(group); }
  nextGroup() {
    const idx = this.steps.indexOf(this.activeGroup());
    this.activeGroup.set(this.steps[Math.min(this.steps.length-1, idx+1)]);
  }
  prevGroup() {
    const idx = this.steps.indexOf(this.activeGroup());
    this.activeGroup.set(this.steps[Math.max(0, idx-1)]);
  }
  skipStep() {
    this.skipped.add(this.activeGroup());
    this.nextGroup();
  }
  isCompleted(step: 'personal'|'income'|'fixed') { return this.steps.indexOf(step) < this.selectedIndex; }
  getState(step: 'personal'|'income'|'fixed') { return this.skipped.has(step) ? 'skipped' : 'number'; }

  title = signal('FinPlan');

  // Defaults for costs and assumptions (injected for configurability)
  private defaults = inject(PLANNER_DEFAULTS);
  defaultHousing = this.defaults.defaultHousing;
  defaultFood = this.defaults.defaultFood;
  realReturnRate = this.defaults.realReturnRate; // 4% annual real return assumed
  retirementAgeDefault = this.defaults.retirementAgeDefault;
  lifeExpectancy = this.defaults.lifeExpectancy;
  inflation = 0.02; // reserved for future use

  // Reactive form acts as the ViewModel for the planner inputs (Model binding)
  form: FormGroup;

  genders = ['Female', 'Male', 'Diverse'];
  industries = ['General', 'Public', 'Tech', 'Healthcare', 'Manufacturing'];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      age: [30, [Validators.required, Validators.min(18), Validators.max(80)]],
      gender: ['Female'], // optional; defaults for target audience
      industry: ['General'],
      netIncome: [3500, [Validators.required, Validators.min(0)]],
      retirementAge: [this.retirementAgeDefault, [Validators.required, Validators.min(55), Validators.max(80)]],
      pensionNeed: [2000, [Validators.required, Validators.min(0)]],
      housing: [this.defaultHousing, [Validators.required, Validators.min(0)]],
      food: [this.defaultFood, [Validators.required, Validators.min(0)]],
      currentSavings: [0, [Validators.min(0)]],
    });
  }

  // Inject service once (signal-friendly) and compute live values in a view-friendly manner
  private calc = inject(FinanceCalculatorService);
  private plannerState = inject(PlannerStateService);

  // Computed values for live feedback
  yearsToRetirement = computed(() => {
    return this.calc.yearsToRetirement({
      age: this.form.get('age')?.value ?? 0,
      retirementAge: this.form.get('retirementAge')?.value ?? this.retirementAgeDefault
    });
  });

  private buildModel(): PlannerFormModel {
    return {
      age: this.form.get('age')?.value ?? 0,
      gender: this.form.get('gender')?.value ?? null,
      industry: this.form.get('industry')?.value ?? null,
      netIncome: this.form.get('netIncome')?.value ?? 0,
      retirementAge: this.form.get('retirementAge')?.value ?? this.retirementAgeDefault,
      pensionNeed: this.form.get('pensionNeed')?.value ?? 0,
      housing: this.form.get('housing')?.value ?? this.defaultHousing,
      food: this.form.get('food')?.value ?? this.defaultFood,
      currentSavings: this.form.get('currentSavings')?.value ?? 0,
    };
  }

  private buildAssumptions(): PlannerAssumptions {
    return {
      realReturnRate: this.realReturnRate,
      lifeExpectancy: this.lifeExpectancy,
    };
  }

  monthlyRequiredSavings = computed(() => {
    const model = this.buildModel();
    const assumptions = this.buildAssumptions();
    return this.calc.summarize(model, assumptions).monthlyRequiredSavings;
  });

  showResults = signal(false);

  goToResults() {
    this.plannerState.set(this.buildModel(), this.buildAssumptions());
    this.showResults.set(true);
  }

  backToPlanner() {
    this.showResults.set(false);
    this.setGroup('personal');
  }
}
