import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { PlannerStateService } from '../core/services/planner-state.service';
import { FinanceCalculatorService } from '../core/services/finance-calculator.service';

interface Point { x: number; y: number; }

function computeMaxY(points: Point[], targetCap: number): number {
  return Math.max(targetCap, ...points.map(p => p.y));
}

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, RouterModule],
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultComponent implements OnInit {
  private state = inject(PlannerStateService);
  private calc = inject(FinanceCalculatorService);
  private router = inject(Router);

  title = signal('Your Forecast');

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

    // Build monthly projection of savings balance
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

  back() {
    this.router.navigateByUrl('/');
  }
}
