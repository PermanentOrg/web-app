import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, SimpleChanges, OnChanges, HostBinding } from '@angular/core';
import { ngIfScaleAnimation } from '@shared/animations';
import { NgbDate, NgbTimeStruct, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { moment } from '@permanent.org/vis-timeline';
import { ItemVO, ArchiveVO } from '@models';
import { applyTimezoneOffset, getOffsetMomentFromDTString, zeroPad, momentFormatNum, getUtcMomentFromOffsetDTString } from '@shared/utilities/dateTime';
import { AccountService } from '@shared/services/account/account.service';
import { checkMinimumAccess, AccessRole } from '@models/access-role';

export type InlineValueEditType = 'text' | 'date' | 'textarea';

type ValueType = string | number;
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
  @Input() readOnlyEmptyMessage: string;
  @Input() loading = false;
  @Input() itemId: any;
  @Input() item: ItemVO;
  @Input() canEdit = true;
  @HostBinding('class.horizontal-controls') @Input() horizontalControls = false;
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
    if (!this.canEdit) {
      return false;
    }

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

  setNgbDateAndTime() {
    if (!this.editValue) {
      this.editValue = moment.utc().toISOString();
    }
    const date = moment.utc(this.editValue);
    applyTimezoneOffset(date, this.item?.TimezoneVO);
    this.ngbDate = NgbDate.from({
      year: momentFormatNum(date, 'YYYY'),
      month: momentFormatNum(date, 'M'),
      day: momentFormatNum(date, 'D')
    });
    this.ngbTime = {
      hour: momentFormatNum(date, 'H'),
      minute: momentFormatNum(date, 'm'),
      second: momentFormatNum(date, 's')
    };
  }

  onDateChange(date: NgbDate) {
    const currentOffset = getOffsetMomentFromDTString(this.editValue as string, this.item?.TimezoneVO);
    const currentTime = currentOffset.format('HH:mm:ss');
    const tzOffset = currentOffset.format('Z');
    const newOffsetString = `${date.year}-${zeroPad(date.month, 2)}-${zeroPad(date.day, 2)}T${currentTime}${tzOffset}`;
    const newOffset = getUtcMomentFromOffsetDTString(newOffsetString);
    this.editValue = newOffset.toISOString();
  }

  onTimeChange(time: NgbTimeStruct) {
    const currentOffset = getOffsetMomentFromDTString(this.editValue as string, this.item?.TimezoneVO);
    const currentDate = currentOffset.format('YYYY-MM-DD');
    const tzOffset = currentOffset.format('Z');
    const newOffsetString = `${currentDate}T${zeroPad(time.hour, 2)}:${zeroPad(time.minute, 2)}:${zeroPad(time.second, 2)}${tzOffset}`;
    const newOffset = getUtcMomentFromOffsetDTString(newOffsetString);
    this.editValue = newOffset.toISOString();
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
