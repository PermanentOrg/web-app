import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockBuilder, ngMocks } from 'ng-mocks';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { ComponentsModule } from '../../components.module';
import { FormInputComponent, FormInputConfig } from './form-input.component';

describe('FormInputComponent', () => {
	let fixture: ComponentFixture<FormInputComponent>;
	let instance: FormInputComponent;

	beforeEach(async () => {
		await MockBuilder(FormInputComponent, ComponentsModule).keep(
			ReactiveFormsModule,
		);

		fixture = TestBed.createComponent(FormInputComponent);
		instance = fixture.componentInstance;
	});

	it('should create with an empty control', () => {
		instance.control = new UntypedFormControl('');
		fixture.detectChanges();

		expect(instance).toBeTruthy();
	});

	it('should create with a control', () => {
		instance.control = new UntypedFormControl('input');
		fixture.detectChanges();

		expect(instance).toBeTruthy();
	});

	it('should bind the input type with empty form control', () => {
		instance.control = new UntypedFormControl('');
		instance.type = 'password';
		fixture.detectChanges();

		const inputElement = ngMocks.find('input').nativeElement;

		expect(inputElement.type).toBe('password');
	});

	it('should bind the input type with form control', () => {
		instance.control = new UntypedFormControl('input');
		instance.type = 'password';
		fixture.detectChanges();

		const inputElement = ngMocks.find('input').nativeElement;

		expect(inputElement.type).toBe('password');
	});

	it('should hide label for empty number inputs', () => {
		instance.control = new UntypedFormControl('');
		instance.type = 'number';
		fixture.detectChanges();

		expect(instance.isLabelHidden()).toBeTrue();
	});

	it('should show label for non-empty text inputs', () => {
		instance.control = new UntypedFormControl('Some text');
		instance.type = 'text';
		fixture.detectChanges();

		expect(instance.isLabelHidden()).toBeFalse();
	});

	it('should set input attributes based on config', () => {
		instance.control = new UntypedFormControl('Some text');
		const config: FormInputConfig = {
			autocorrect: 'off',
			autocapitalize: 'off',
			spellcheck: 'off',
		};
		instance.config = config;
		fixture.detectChanges();

		const inputElement = ngMocks.find('input').nativeElement;

		expect(inputElement.getAttribute('autocorrect')).toBe(config.autocorrect);

		expect(inputElement.getAttribute('autocapitalize')).toBe(
			config.autocapitalize,
		);

		expect(inputElement.getAttribute('spellcheck')).toBe(config.spellcheck);
	});

	it('should emit valueChange event on input value change', () => {
		instance.control = new UntypedFormControl('');
		fixture.detectChanges();

		const mockValue = 'test value';
		const spy = spyOn(instance.valueChangeSubject, 'next');

		instance.onInputChange(mockValue);

		expect(spy).toHaveBeenCalledWith(mockValue);
	});

	it('should apply right-align class based on config', () => {
		instance.control = new UntypedFormControl('');
		instance.config = { textAlign: 'right' };
		fixture.detectChanges();

		expect(instance.rightAlign).toBeTrue();
	});

	it('should bind the placeholder attribute to the input element', () => {
		instance.control = new UntypedFormControl('');
		const placeholderValue = 'Enter text here';
		instance.placeholder = placeholderValue;
		fixture.detectChanges();

		const inputElement = ngMocks.find('input').nativeElement;

		expect(inputElement.placeholder).toBe(placeholderValue);
	});

	it('should return the correct error from the validation array', () => {
		instance.control = new UntypedFormControl('');
		instance.validators = [
			{
				validation: 'minLength',
				message: 'Must be at least 3 characters',
				value: 3,
			},
			{
				validation: 'maxLength',
				message: 'Must be at most 10 characters',
				value: 10,
			},
		];
		fixture.detectChanges();

		const errorMessage = instance.getInputErrorFromValue('aa');

		expect(errorMessage).toBe('Must be at least 3 characters');
	});
});
