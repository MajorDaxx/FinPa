import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { PlannerStateService } from '../core/services/planner-state.service';
import { FinanceCalculatorService } from '../core/services/finance-calculator.service';

interface Point { x: number; y: number; }

function computeMaxY(points: Point[], targetCap: number): number {
  return Math.max(targetCap, ...points.map(p => p.y));
}

@Component({
  selector: 'app-result-inline',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
  <style>
    .chart { width: 100%; height: 240px; }
    svg { width: 100%; height: 100%; overflow: visible; }
    .axis text { font-size: 10px; fill: var(--mat-sys-on-surface-variant); }
    .line { fill: none; stroke-width: 2.5; }
    .savings { stroke: var(--mat-sys-primary); }
    .target { stroke: var(--mat-sys-secondary); stroke-dasharray: 6 4; }
    .legend { display: flex; gap: 12px; font-size: 12px; color: var(--mat-sys-on-surface-variant); }
    .key { display: inline-flex; align-items: center; gap: 6px; }
    .dot { width: 12px; height: 3px; border-radius: 2px; background: var(--mat-sys-primary); }
    .dot2 { width: 12px; height: 3px; border-radius: 2px; background: var(--mat-sys-secondary); }
  </style>

  <mat-card>
    <mat-card-header>
      <mat-card-title>Forecast Overview</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <div class="legend">
        <span class="key"><span class="dot"></span>Projected savings</span>
        <span class="key"><span class="dot2"></span>Target at retirement</span>
      </div>
      <div class="chart" *ngIf="data() as d">
        <svg [attr.viewBox]="'0 0 600 240'">
          <ng-container *ngIf="d.savings.length > 0">
            <g class="axis">
              <text x="0" y="230">0y</text>
              <text x="540" y="230">{{ d.years }}y</text>
            </g>
            <line class="line target" x1="0" [attr.y1]="targetY(d.targetCap, d)"
                  x2="600" [attr.y2]="targetY(d.targetCap, d)"></line>
            <polyline class="line savings" [attr.points]="polylinePoints(d)"></polyline>
          </ng-container>
        </svg>
      </div>
    </mat-card-content>
  </mat-card>

  <mat-card style="margin-top:12px;">
    <mat-card-content>
      <button mat-stroked-button color="primary" (click)="back()">Back to planner</button>
    </mat-card-content>
  </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultInlineComponent implements OnInit {
  private state = inject(PlannerStateService);
  private calc = inject(FinanceCalculatorService);

  @Output() backToPlanner = new EventEmitter<void>();

  data = signal<{ savings: Point[]; targetCap: number; years: number; maxX: number; maxY: number } | null>(null);

  targetY(value: number, d: { maxY: number }): number {
    const maxY = d.maxY || 1;
    return 240 - (value / maxY) * 200 - 20;
  }

  polylinePoints(d: { savings: Point[]; maxX: number; maxY: number }): string {
    const maxX = d.maxX || 1;
    const maxY = d.maxY || 1;
    return d.savings.map(p => {
      const x = (p.x / maxX) * 560 + 20;
      const y = 240 - (p.y / maxY) * 200 - 20;
      return `${x},${y}`;
    }).join(' ');
  }

  ngOnInit() {
    const snap = this.state.get();
    const years = this.calc.yearsToRetirement({ age: snap.model.age, retirementAge: snap.model.retirementAge });
    const months = Math.max(0, years * 12);
    const r = (snap.assumptions.realReturnRate ?? 0) / 12;
    const targetCap = this.calc.neededCapitalAtRetirement(
      snap.model.pensionNeed,
      snap.assumptions.realReturnRate,
      Math.max(1, snap.assumptions.lifeExpectancy - snap.model.retirementAge)
    );

    const points: Point[] = [];
    let balance = snap.model.currentSavings ?? 0;
    const monthlyRequired = this.calc.requiredMonthlySavings(targetCap, balance, r, months);
    for (let m = 0; m <= months; m++) {
      if (m > 0) {
        balance = balance * (1 + r) + monthlyRequired;
      }
      points.push({ x: m, y: balance });
    }
    const maxX = months;
    const maxY = computeMaxY(points, targetCap);
    this.data.set({ savings: points, targetCap, years, maxX, maxY });
  }

  back() { this.backToPlanner.emit(); }
}
