import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, SimpleChanges, OnChanges } from '@angular/core';

export type InlineValueEditType = 'text' | 'date' | 'textarea';

type ValueType = string | number | Date;
@Component({
  selector: 'pr-inline-value-edit',
  templateUrl: './inline-value-edit.component.html',
  styleUrls: ['./inline-value-edit.component.scss']
})
export class InlineValueEditComponent implements OnInit, OnChanges {
  @Input() displayValue: ValueType;
  @Input() type: InlineValueEditType = 'text';
  @Input() emptyMessage: string;
  @Input() loading = false;
  @Input() itemId: any;
  @Output() doneEditing: EventEmitter<ValueType> = new EventEmitter<ValueType>();

  @ViewChild('input') inputElementRef: ElementRef;

  isEditing = false;
  editValue: ValueType;

  constructor(
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.itemId) {
      if (changes.itemId.currentValue !== changes.itemId.previousValue) {
        this.isEditing = false;
      }
    }
  }

  startEdit() {
    this.editValue = this.displayValue;
    this.isEditing = true;
    this.focusInput();
  }

  endEdit() {
    if (this.displayValue !== this.editValue) {
      this.doneEditing.emit(this.editValue);
    }
    this.isEditing = false;
  }

  onBlur() {
    this.endEdit();
  }

  focusInput() {
    (this.inputElementRef.nativeElement as HTMLInputElement).focus();
  }
}
