import { Shallow } from 'shallow-render';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { ComponentsModule } from '../../components.module';
import { FormInputComponent, FormInputConfig } from './form-input.component';

describe('FormInputComponent', () => {
	let shallow: Shallow<FormInputComponent>;

	beforeEach(async () => {
		shallow = new Shallow(FormInputComponent, ComponentsModule).import(
			ReactiveFormsModule,
		);
	});

	it('should create with an empty control', async () => {
		const mockControl = new UntypedFormControl('');
		const { instance } = await shallow.render({
			bind: { control: mockControl },
		});

		expect(instance).toBeTruthy();
	});

	it('should create with a control', async () => {
		const mockControl = new UntypedFormControl('input');
		const { instance } = await shallow.render({
			bind: { control: mockControl },
		});

		expect(instance).toBeTruthy();
	});

	it('should bind the input type with empty form control', async () => {
		const mockControl = new UntypedFormControl('');
		const { find } = await shallow.render({
			bind: { type: 'password', control: mockControl },
		});

		const inputElement = find('input').nativeElement;

		expect(inputElement.type).toBe('password');
	});

	it('should bind the input type with form control', async () => {
		const control = new UntypedFormControl('input');
		const { find } = await shallow.render({
			bind: { control, type: 'password' },
		});

		const inputElement = find('input').nativeElement;

		expect(inputElement.type).toBe('password');
	});

	it('should hide label for empty number inputs', async () => {
		const mockControl = new UntypedFormControl('');

		const { instance } = await shallow.render({
			bind: { type: 'number', control: mockControl },
		});

		expect(instance.isLabelHidden()).toBeTrue();
	});

	it('should show label for non-empty text inputs', async () => {
		const mockControl = new UntypedFormControl('Some text');

		const { instance } = await shallow.render({
			bind: { type: 'text', control: mockControl },
		});

		expect(instance.isLabelHidden()).toBeFalse();
	});

	it('should set input attributes based on config', async () => {
		const mockControl = new UntypedFormControl('Some text');

		const config: FormInputConfig = {
			autocorrect: 'off',
			autocapitalize: 'off',
			spellcheck: 'off',
		};
		const { find } = await shallow.render({
			bind: { config, control: mockControl },
		});

		const inputElement = find('input').nativeElement;

		expect(inputElement.getAttribute('autocorrect')).toBe(config.autocorrect);

		expect(inputElement.getAttribute('autocapitalize')).toBe(
			config.autocapitalize,
		);

		expect(inputElement.getAttribute('spellcheck')).toBe(config.spellcheck);
	});

	it('should emit valueChange event on input value change', async () => {
		const mockControl = new UntypedFormControl('');

		const mockValue = 'test value';
		const { instance } = await shallow.render({
			bind: { control: mockControl },
		});

		const spy = spyOn(instance.valueChangeSubject, 'next');

		instance.onInputChange(mockValue);

		expect(spy).toHaveBeenCalledWith(mockValue);
	});

	it('should apply right-align class based on config', async () => {
		const mockControl = new UntypedFormControl('');
		const { instance, fixture } = await shallow.render({
			bind: { config: { textAlign: 'right' }, control: mockControl },
		});
		fixture.detectChanges();

		expect(instance.rightAlign).toBeTrue();
	});

	it('should bind the placeholder attribute to the input element', async () => {
		const mockControl = new UntypedFormControl('');
		const placeholderValue = 'Enter text here';
		const { find } = await shallow.render({
			bind: { placeholder: placeholderValue, control: mockControl },
		});

		const inputElement = find('input').nativeElement;

		expect(inputElement.placeholder).toBe(placeholderValue);
	});

	it('should return the correct error from the validation array', async () => {
		const mockControl = new UntypedFormControl('');
		const { instance } = await shallow.render({
			bind: {
				validators: [
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
				],
				control: mockControl,
			},
		});

		const errorMessage = instance.getInputErrorFromValue('aa');

		expect(errorMessage).toBe('Must be at least 3 characters');
	});
});
