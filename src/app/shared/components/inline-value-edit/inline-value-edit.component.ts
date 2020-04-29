import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';

export type InlineValueEditType = 'text' | 'date' | 'textarea';

type ValueType = string | number | Date;
@Component({
  selector: 'pr-inline-value-edit',
  templateUrl: './inline-value-edit.component.html',
  styleUrls: ['./inline-value-edit.component.scss']
})
export class InlineValueEditComponent implements OnInit {
  @Input() displayValue: ValueType;
  @Input() type: InlineValueEditType = 'text';
  @Output() doneEditing: EventEmitter<ValueType> = new EventEmitter<ValueType>();

  @ViewChild('input') inputElementRef: ElementRef;

  isEditing = false;
  editValue: ValueType;

  constructor(
  ) { }

  ngOnInit(): void {
  }

  startEdit() {
    console.log('start edit?');
    this.editValue = this.displayValue;
    this.isEditing = true;
    this.focusInput();
  }

  endEdit() {
    this.doneEditing.emit(this.editValue);
    this.isEditing = false;
  }

  onBlur() {
    this.endEdit();
  }

  focusInput() {
    (this.inputElementRef.nativeElement as HTMLInputElement).focus();
  }
}
