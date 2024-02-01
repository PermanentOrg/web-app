/* @format */
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
  selector: 'pr-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
})
export class ToggleComponent implements OnInit {
  @Input() isChecked: boolean = false;
  @Input() text: string = '';
  @Input() disabled: boolean = false;
  @Output() isCheckedChange = new EventEmitter<boolean>();

  ngOnInit() {
    if (this.disabled) {
      this.isChecked = false;
    }
  }

  toggleSwitch() {
    if (!this.disabled) {
      this.isCheckedChange.emit(!this.isChecked);
    }
  }
}
