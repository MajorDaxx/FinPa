import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-personal-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTooltipModule],
  templateUrl: './personal-group.component.html',
  styleUrls: ['./personal-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonalGroupComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input() genders: string[] = [];
  @Input() industries: string[] = [];
}
