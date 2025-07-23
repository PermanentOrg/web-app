/* @format */
import { Component, EventEmitter, Input, Output } from '@angular/core';

type Value = string | number | boolean;
type Variant = 'primary' | 'secondary';

@Component({
  selector: 'pr-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  standalone: false,
})
export class CheckboxComponent {
  @Input() isChecked: boolean = false;
  @Output() isCheckedChange = new EventEmitter<string | number | boolean>();
  @Input() text: string = '';
  @Input() value: Value = '';
  @Input() disabled: boolean = false;
  @Input() variant: Variant = 'primary';
  @Input() onboarding: boolean = false;

  toggleCheck() {
    if (!this.disabled) {
      this.isChecked = !this.isChecked;
      this.isCheckedChange.emit(this.isChecked);
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    if (!this.disabled) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.toggleCheck();
      }
    }
  }
}
