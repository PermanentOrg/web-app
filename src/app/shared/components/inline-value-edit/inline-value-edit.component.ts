import {
	Component,
	OnInit,
	Input,
	Output,
	EventEmitter,
	ElementRef,
	ViewChild,
	SimpleChanges,
	OnChanges,
	HostBinding,
} from '@angular/core';
import { ngIfScaleAnimation, collapseAnimation } from '@shared/animations';
import {
	NgbDate,
	NgbTimeStruct,
	NgbDatepicker,
	NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { ItemVO } from '@models';
import {
	applyTimezoneOffset,
	getOffsetMomentFromDTString,
	zeroPad,
	momentFormatNum,
	getUtcMomentFromOffsetDTString,
} from '@shared/utilities/dateTime';
import { ENTER } from '@angular/cdk/keycodes';
import { NgModel, UntypedFormControl, Validators } from '@angular/forms';
import { getDate, getMonth, getYear } from 'date-fns';
import { FormInputSelectOption } from '../form-input/form-input.component';

export type InlineValueEditType =
	| 'text'
	| 'date'
	| 'textarea'
	| 'select'
	| 'external';

type ValueType = string | number;
@Component({
	selector: 'pr-inline-value-edit',
	templateUrl: './inline-value-edit.component.html',
	styleUrls: ['./inline-value-edit.component.scss'],
	animations: [ngIfScaleAnimation, collapseAnimation],
	standalone: false,
})
export class InlineValueEditComponent implements OnInit, OnChanges {
	@Input() displayBorder: boolean = false;
	@Input() displayValue: ValueType;
	@Input() type: InlineValueEditType = 'text';
	@Input() emptyMessage: string;
	@Input() readOnlyEmptyMessage: string;
	@Input() loading = false;
	@Input() itemId: any;
	@Input() item: ItemVO;
	@Input() canEdit = true;
	@Input() required = false;
	@Input() minLength: number = null;
	@Input() maxLength: number = null;
	@Input() email = false;
	@Input() noScroll = true;
	@Input() saveOnBlur = true;
	@Input() selectOptions: FormInputSelectOption[];
	@Input() dateOnly = false;
	@Input() class: string;
	@Input() isPublicArchive = false;

	@HostBinding('class.horizontal-controls') @Input() horizontalControls = false;
	@HostBinding('class.always-show') @Input() alwaysShow = false;
	@Output() doneEditing: EventEmitter<ValueType> =
		new EventEmitter<ValueType>();
	@Output() externalEdit: EventEmitter<ValueType> =
		new EventEmitter<ValueType>();
	@Output() toggledDatePicker: EventEmitter<boolean> =
		new EventEmitter<boolean>();

	formControl: UntypedFormControl;
	@ViewChild('input') inputElementRef: ElementRef;
	@ViewChild(NgModel) ngModel: NgModel;
	@ViewChild('datePicker') datePicker: NgbDatepicker;

	isEditing = false;
	editValue: ValueType;
	ngbTime: NgbTimeStruct;
	ngbDate: NgbDate;
	maxNgbDate: NgbDateStruct;
	isNameHovered = false;

	public extraClasses: string[];

	constructor(private elementRef: ElementRef) {
		this.extraClasses = [];
	}

	ngOnInit(): void {
		if (this.type === 'select') {
			this.editValue = this.displayValue;
		}

		const validators = [];
		if (this.required) {
			validators.push(Validators.required);
		}

		if (this.minLength) {
			validators.push(Validators.minLength(this.minLength));
		}

		if (this.email) {
			validators.push(Validators.email);
		}

		if (this.class) {
			this.extraClasses = this.class.split(' ');
		}

		this.elementRef.nativeElement.addEventListener(
			'keydown',
			(event: KeyboardEvent) => {
				event.stopPropagation();
			},
		);
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
			this.toggledDatePicker.emit(true);
			setTimeout(() => {
				this.datePicker.focusSelect();
			});
		} else {
			this.editValue = this.displayValue;
		}
		this.isEditing = true;
		this.focusInput();

		if (!this.noScroll) {
			setTimeout(() => {
				(this.elementRef.nativeElement as HTMLElement).scrollIntoView({
					behavior: 'smooth',
					block: 'start',
				});
			});
		}
	}

	startExternalEdit() {
		this.externalEdit.emit();
	}

	save(skipBlur = false) {
		if (this.type !== 'select' && (this.ngModel?.invalid || !this.isEditing)) {
			return;
		}

		if (this.type === 'date') {
			this.toggledDatePicker.emit(false);
		}

		if (this.displayValue !== this.editValue) {
			this.doneEditing.emit(this.editValue);
		}
		this.isEditing = false;
		if (!skipBlur) {
			this.blurInput();
		}
	}

	cancel() {
		if (this.type === 'date') {
			this.toggledDatePicker.emit(false);
		}
		this.editValue = this.displayValue;
		this.isEditing = false;
		this.blurInput();
	}

	onDisplayClick(event: MouseEvent): void {
		const target = event.target as HTMLElement;
		if (target.closest('a')) {
			return;
		}

		this.startEdit();
	}

	setNgbDateAndTime() {
		if (!this.editValue) {
			this.editValue = moment.utc().toISOString();
		}
		const date = moment.utc(this.editValue);
		if (!this.dateOnly) {
			applyTimezoneOffset(date, this.item?.TimezoneVO);
		}
		this.ngbDate = NgbDate.from({
			year: momentFormatNum(date, 'YYYY'),
			month: momentFormatNum(date, 'M'),
			day: momentFormatNum(date, 'D'),
		});
		this.ngbTime = {
			hour: momentFormatNum(date, 'H'),
			minute: momentFormatNum(date, 'm'),
			second: momentFormatNum(date, 's'),
		};

		const now = new Date();
		this.maxNgbDate = {
			year: getYear(now),
			month: getMonth(now) + 1,
			day: getDate(now) + 1,
		};
	}

	onDateChange(date: NgbDate) {
		if (this.dateOnly) {
			this.editValue = `${zeroPad(date.year, 4)}-${zeroPad(
				date.month,
				2,
			)}-${zeroPad(date.day, 2)}`;
		} else {
			const currentOffset = getOffsetMomentFromDTString(
				this.editValue as string,
				this.item?.TimezoneVO,
			);
			const currentTime = currentOffset.format('HH:mm:ss');
			const tzOffset = currentOffset.format('Z');
			const newOffsetString = `${date.year}-${zeroPad(date.month, 2)}-${zeroPad(
				date.day,
				2,
			)}T${currentTime}${tzOffset}`;
			const newOffset = getUtcMomentFromOffsetDTString(newOffsetString);
			this.editValue = newOffset.toISOString();
		}
	}

	onTimeChange(time: NgbTimeStruct) {
		const currentOffset = getOffsetMomentFromDTString(
			this.editValue as string,
			this.item?.TimezoneVO,
		);
		const currentDate = currentOffset.format('YYYY-MM-DD');
		const tzOffset = currentOffset.format('Z');
		const newOffsetString = `${currentDate}T${zeroPad(time.hour, 2)}:${zeroPad(
			time.minute,
			2,
		)}:${zeroPad(time.second, 2)}${tzOffset}`;
		const newOffset = getUtcMomentFromOffsetDTString(newOffsetString);
		this.editValue = newOffset.toISOString();
	}

	focusInput() {
		if (this.inputElementRef) {
			(this.inputElementRef.nativeElement as HTMLInputElement).focus();
		}
		if (this.datePicker) {
			this.datePicker.focusSelect();
		}
	}

	blurInput() {
		if (this.inputElementRef) {
			(this.inputElementRef.nativeElement as HTMLInputElement).blur();
		}
	}

	onTextInputBlur() {
		if (this.saveOnBlur) {
			this.save(true);
		}
	}

	onTextInputKeydown(event: KeyboardEvent) {
		if (event.keyCode === ENTER) {
			this.save();
		}
	}
}
