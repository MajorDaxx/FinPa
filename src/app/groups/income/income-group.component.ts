import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-income-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatTooltipModule],
  templateUrl: './income-group.component.html',
  styleUrls: ['./income-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncomeGroupComponent {
  @Input({ required: true }) form!: FormGroup;
}
