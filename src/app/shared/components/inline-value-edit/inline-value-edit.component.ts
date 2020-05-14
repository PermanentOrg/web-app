import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import { ngIfScaleAnimation } from '@shared/animations';
import { NgbDate, NgbTimeStruct, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { moment } from '@permanent.org/vis-timeline';
import { ItemVO } from '@models';

export type InlineValueEditType = 'text' | 'date' | 'textarea';

type ValueType = string | number | Date;
@Component({
  selector: 'pr-inline-value-edit',
  templateUrl: './inline-value-edit.component.html',
  styleUrls: ['./inline-value-edit.component.scss'],
  animations: [ ngIfScaleAnimation ]
})
export class InlineValueEditComponent implements OnInit, OnChanges {
  @Input() displayValue: ValueType;
  @Input() type: InlineValueEditType = 'text';
  @Input() emptyMessage: string;
  @Input() loading = false;
  @Input() itemId: any;
  @Input() item: ItemVO;
  @Output() doneEditing: EventEmitter<ValueType> = new EventEmitter<ValueType>();

  @ViewChild('input') inputElementRef: ElementRef;
  @ViewChild('datePicker') datePicker: NgbDatepicker;

  isEditing = false;
  editValue: ValueType;
  ngbTime: NgbTimeStruct;
  ngbDate: NgbDate;

  constructor(
    private elementRef: ElementRef
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
    if (this.type === 'date') {
      this.editValue = moment.utc(this.displayValue).toISOString();
      this.setNgbDateAndTime();
      this.datePicker.focusDate(this.ngbDate);
      setTimeout(() => {
        this.datePicker.focusSelect();
      });
    } else {
      this.editValue = this.displayValue;
    }
    this.isEditing = true;
    this.focusInput();

    setTimeout(() => {
      (this.elementRef.nativeElement as HTMLElement).scrollIntoView({behavior: 'smooth', block: 'start'});
    });
  }

  save() {
    if (this.displayValue !== this.editValue) {
      this.doneEditing.emit(this.editValue);
    }
    this.isEditing = false;
    this.blurInput();
  }

  cancel() {
    this.editValue = this.displayValue;
    this.isEditing = false;
    this.blurInput();
  }

  endEdit() {
    if (this.displayValue !== this.editValue) {
      this.doneEditing.emit(this.editValue);
    }
    this.isEditing = false;
  }

  onBlur() {
    // this.endEdit();
  }

  setNgbDateAndTime() {
    const date = moment.utc(this.editValue);
    this.ngbDate = NgbDate.from({
      year: date.year(),
      month: date.month() + 1,
      day: date.date()
    });
    this.ngbTime = {
      hour: date.hours(),
      minute: date.minutes(),
      second: date.seconds()
    };
  }

  onDateChange(date: NgbDate) {
    const currentDateTime = moment.utc(this.editValue);
    const dateString = `${date.year}-${date.month}-${date.day}`;
    const newDate = moment.utc(dateString);
    newDate.hours(currentDateTime.hours()).minutes(currentDateTime.minutes()).seconds(currentDateTime.seconds());
    this.editValue = newDate.toISOString();
  }

  onTimeChange(time: NgbTimeStruct) {
    const currentDateTime = moment.utc(this.editValue);
    currentDateTime.hours(time.hour).minutes(time.minute).seconds(time.second);
    this.editValue = currentDateTime.toISOString();
  }

  focusInput() {
    if (this.inputElementRef) {
      (this.inputElementRef.nativeElement as HTMLInputElement).focus();
    }
  }

  blurInput() {
    if (this.inputElementRef) {
      (this.inputElementRef.nativeElement as HTMLInputElement).blur();
    }
  }
}
