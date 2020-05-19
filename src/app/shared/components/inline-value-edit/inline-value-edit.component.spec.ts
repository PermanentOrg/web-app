import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { InlineValueEditComponent } from './inline-value-edit.component';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgbDatepickerModule, NgbTimepickerModule, NgbDate, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@shared/shared.module';

import { moment } from '@permanent.org/vis-timeline';
import { RecordVO, TimezoneVOData, RecordVOData } from '@models';
import { getOffsetMomentFromDTString, formatDateISOString, getUtcMomentFromDTString, momentFormatNum, applyTimezoneOffset } from '@shared/utilities/dateTime';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('InlineValueEditComponent', () => {
  let component: InlineValueEditComponent;
  let fixture: ComponentFixture<InlineValueEditComponent>;

  const TEST_TEXT = 'Test Name';

  const mockDatePicker = {

  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InlineValueEditComponent ],
      imports: [
        FormsModule,
        NgbDatepickerModule,
        NgbTimepickerModule,
        NoopAnimationsModule,
        SharedModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InlineValueEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initalize input with given value when editing starts', () => {
    component.displayValue = TEST_TEXT;
    component.startEdit();

    expect(component.editValue).toEqual(TEST_TEXT);
  });

  it('should start editing with click', fakeAsync(() => {
    const displayElement = fixture.debugElement.query(By.css('.inline-value-display'));
    displayElement.triggerEventHandler('click', null);
    tick();
    expect(component.isEditing).toBeTruthy();
  }));

  it('should focus input when starting edit', () => {
    component.displayValue = TEST_TEXT;
    component.startEdit();
    const inputElement = fixture.debugElement.query(By.css('input'));
    expect(document.activeElement).toBe(inputElement.nativeElement);
  });

  it('should emit final value when saving', () => {
    component.displayValue = TEST_TEXT;
    component.startEdit();

    let doneValue;

    component.doneEditing.subscribe((value) => {
      doneValue = value;
    });

    component.editValue = 'i have changed it...';

    component.save();

    expect(doneValue).toEqual(component.editValue);
  });

  it('should stop editing on cancel', async () => {
    component.displayValue = TEST_TEXT;
    component.startEdit();
    expect(component.isEditing).toBeTruthy();

    component.cancel();

    expect(component.isEditing).toBeFalsy();
  });



  it('should set initial date and time based on local time with no timezone passed', () => {
    const displayDT = formatDateISOString('2017-05-13T16:36:29.000000');
    component.displayValue = displayDT;
    component.type = 'date';
    fixture.detectChanges();

    component.startEdit();

    const local = moment.utc(displayDT).local();

    expect(component.ngbDate).toBeDefined();
    expect(component.ngbDate.day).toBe(momentFormatNum(local, 'D'));
    expect(component.ngbTime).toBeDefined();
    expect(component.ngbTime.hour).toBe(momentFormatNum(local, 'H'));
  });

  it('should set initial date and time based on timezone', () => {
    const voData: RecordVOData = {
      displayDT: '2017-05-13T16:36:29.000000',
      TimezoneVO: {
        dstAbbrev: 'PDT',
        dstOffset: '-07:00',
        stdAbbrev: 'PST',
        stdOffset: '-08:00',
      }
    };
    const record = new RecordVO(voData);
    component.item = record;
    component.displayValue = record.displayDT;
    component.type = 'date';
    fixture.detectChanges();

    component.startEdit();

    const offset = getOffsetMomentFromDTString(record.displayDT, record.TimezoneVO);

    expect(component.ngbDate).toBeDefined();
    expect(component.ngbDate.day).toBe(momentFormatNum(offset, 'D'));
    expect(component.ngbTime).toBeDefined();
    expect(component.ngbTime.hour).toBe(momentFormatNum(offset, 'H'));
  });

  it('should default to current date and time based on timezone', () => {
    const voData: RecordVOData = {
      displayDT: null,
      TimezoneVO: {
        dstAbbrev: 'PDT',
        dstOffset: '-07:00',
        stdAbbrev: 'PST',
        stdOffset: '-08:00',
      }
    };
    const record = new RecordVO(voData);
    component.item = record;
    component.displayValue = record.displayDT;
    component.type = 'date';
    fixture.detectChanges();

    const nowUtc = moment.utc();

    const offset = applyTimezoneOffset(nowUtc, record.TimezoneVO);

    component.startEdit();
    expect(component.ngbDate).toBeDefined();
    expect(component.ngbDate.day).toBe(momentFormatNum(offset, 'D'));
    expect(component.ngbTime).toBeDefined();
    expect(component.ngbTime.hour).toBe(momentFormatNum(offset, 'H'));
  });

  it('should default to current date and time in local timezone when missing timezone', () => {
    const voData: RecordVOData = {
      displayDT: null,
    };

    const record = new RecordVO(voData);
    component.item = record;
    component.displayValue = record.displayDT;
    component.type = 'date';
    fixture.detectChanges();

    const offset = moment.utc().local();

    component.startEdit();
    expect(component.ngbDate).toBeDefined();
    expect(component.ngbDate.day).toBe(momentFormatNum(offset, 'D'));
    expect(component.ngbTime).toBeDefined();
    expect(component.ngbTime.hour).toBe(momentFormatNum(offset, 'H'));
  });

  it('should update edit value when date is changed', () => {
    const voData: RecordVOData = {
      displayDT: '2017-05-14T02:36:29.000000',
      TimezoneVO: {
        dstAbbrev: 'PDT',
        dstOffset: '-07:00',
        stdAbbrev: 'PST',
        stdOffset: '-08:00',
      }
    };
    const record = new RecordVO(voData);
    component.item = record;
    component.displayValue = record.displayDT;
    component.type = 'date';
    fixture.detectChanges();

    component.startEdit();

    const offset = getOffsetMomentFromDTString(record.displayDT, record.TimezoneVO);

    expect(component.ngbTime.hour).toBe(momentFormatNum(offset, 'H'));

    const newDate = NgbDate.from({year: 2017, month: 5, day: 10});
    component.datePicker.dateSelect.emit(newDate);

    const utcDt = getUtcMomentFromDTString(component.editValue as string);
    expect(Number(utcDt.format('D'))).toEqual(11);
    expect(Number(utcDt.format('M'))).toEqual(newDate.month);
    expect(Number(utcDt.format('H'))).toEqual(2);
  });

  it('should update edit value when time is changed', () => {
    const voData: RecordVOData = {
      displayDT: '2017-05-14T02:36:29.000000',
      TimezoneVO: {
        dstAbbrev: 'PDT',
        dstOffset: '-07:00',
        stdAbbrev: 'PST',
        stdOffset: '-08:00',
      }
    };
    const record = new RecordVO(voData);
    component.item = record;
    component.displayValue = record.displayDT;
    component.type = 'date';
    fixture.detectChanges();

    component.startEdit();

    const offset = getOffsetMomentFromDTString(record.displayDT, record.TimezoneVO);

    expect(component.ngbDate.day).toBe(momentFormatNum(offset, 'D'));

    const newTime: NgbTimeStruct = {
      hour: 8,
      minute: 30,
      second: 58
    };

    component.ngbTime = newTime;
    component.onTimeChange(newTime);

    expect(component.editValue).not.toBe(component.displayValue);

    const utcDt = getUtcMomentFromDTString(component.editValue as string);
    expect(Number(utcDt.format('D'))).toEqual(13);
    expect(Number(utcDt.format('h'))).toEqual(3);
  });
});
