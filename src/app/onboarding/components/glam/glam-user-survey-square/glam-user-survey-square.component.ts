import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CheckboxComponent } from '@root/app/component-library/components/checkbox/checkbox.component';

@Component({
  selector: 'pr-glam-user-survey-square',
  templateUrl: './glam-user-survey-square.component.html',
  styleUrl: './glam-user-survey-square.component.scss',
  imports: [CheckboxComponent],
  standalone: true,
})
export class GlamUserSurveySquareComponent {
  @Input() text: string;
  @Input() tag: string;
  @Input() selected: boolean = false;
  @Output() selectedChange = new EventEmitter<string>();

  select() {
    this.selected = !this.selected;
    this.selectedChange.emit(this.tag);
  }
}
