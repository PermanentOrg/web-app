import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	FormsModule,
	ReactiveFormsModule,
	UntypedFormControl,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import {
	FormInputComponent,
	FormInputSelectOption,
} from './form-input.component';

describe('FormInputComponent', () => {
	let component: FormInputComponent;
	let fixture: ComponentFixture<FormInputComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [FormInputComponent],
			imports: [FormsModule, ReactiveFormsModule],
		}).compileComponents();

		fixture = TestBed.createComponent(FormInputComponent);
		component = fixture.componentInstance;
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should render a text input when type is not "select"', () => {
		component.type = 'text';
		component.fieldName = 'username';
		component.placeholder = 'Enter username';
		component.control = new UntypedFormControl('');
		fixture.detectChanges();

		const inputEl = fixture.debugElement.query(By.css('input.form-control'));

		expect(inputEl).toBeTruthy();
		expect(inputEl.nativeElement.placeholder).toBe('Enter username');
	});

	it('should render a select when type is "select"', () => {
		component.type = 'select';
		component.fieldName = 'country';
		component.placeholder = 'Select country';
		component.selectOptions = [
			{ value: 'us', text: 'USA' },
			{ value: 'ca', text: 'Canada' },
		];
		component.control = new UntypedFormControl('');
		fixture.detectChanges();

		const selectEl = fixture.debugElement.query(By.css('select'));

		expect(selectEl).toBeTruthy();
		const options = selectEl.queryAll(By.css('option'));

		expect(options.length).toBe(2);
	});

	it('should toggle openStatus when openSelect() is called', () => {
		expect(component.openStatus).toBeFalse();
		component.openSelect();

		expect(component.openStatus).toBeTrue();
		component.openSelect();

		expect(component.openStatus).toBeFalse();
	});

	it('should reset openStatus and alert when handleChange() is called', () => {
		spyOn(window, 'alert');
		component.openStatus = true;
		component.handleChange();

		expect(component.openStatus).toBeFalse();
		expect(window.alert).toHaveBeenCalledWith('Element selected... closed');
	});

	it('should display the correct option text from value', () => {
		const options: FormInputSelectOption[] = [
			{ text: 'Apple', value: 'a' },
			{ text: 'Banana', value: 'b' },
		];
		component.selectOptions = options;
		const result = component.getOptionTextFromValue('b');

		expect(result).toBe('Banana');
	});

	it('should hide label if value is empty and type is number', () => {
		component.type = 'number';
		component.control = new UntypedFormControl('');

		expect(component.isLabelHidden()).toBeTrue();
	});

	it('should not hide label if type is date', () => {
		component.type = 'date';
		component.control = new UntypedFormControl('');

		expect(component.isLabelHidden()).toBeFalse();
	});
});
