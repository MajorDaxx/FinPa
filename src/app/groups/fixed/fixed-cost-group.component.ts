import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-fixed-cost-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatTooltipModule],
  templateUrl: './fixed-cost-group.component.html',
  styleUrls: ['./fixed-cost-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FixedCostGroupComponent {
  @Input({ required: true }) form!: FormGroup;
}
