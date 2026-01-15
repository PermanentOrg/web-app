import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockBuilder, ngMocks } from 'ng-mocks';
import { ComponentsModule } from '../../components.module';
import { CheckboxComponent } from './checkbox.component';

describe('CheckboxCompoent', () => {
	let fixture: ComponentFixture<CheckboxComponent>;
	let instance: CheckboxComponent;

	beforeEach(async () => {
		await MockBuilder(CheckboxComponent, ComponentsModule);

		fixture = TestBed.createComponent(CheckboxComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(instance).toBeTruthy();
	});

	it('should have the disabled class if the checkbox is disabled', () => {
		instance.disabled = true;
		fixture.detectChanges();
		const checkbox = ngMocks.find('.checkbox-container').nativeElement;

		expect(checkbox.classList).toContain('checkbox-container-disabled');
		expect(checkbox.classList).not.toContain('checkbox-container-enabled');
	});

	it('should have the enabled class if the checkbox is enabled', () => {
		const checkbox = ngMocks.find('.checkbox-container').nativeElement;

		expect(checkbox.classList).toContain('checkbox-container-enabled');
		expect(checkbox.classList).not.toContain('checkbox-container-disabled');
	});

	it('should have the checked class if the checkbox is checked', () => {
		instance.isChecked = true;
		fixture.detectChanges();
		const checkbox = ngMocks.find('.checkbox').nativeElement;

		expect(checkbox.classList).toContain('checked');
	});

	it('should emit the correct value when the checkbox is clicked', () => {
		spyOn(instance.isCheckedChange, 'emit');
		instance.value = 'value';
		fixture.detectChanges();
		const checkbox = ngMocks.find('.checkbox-container').nativeElement;

		checkbox.click();

		expect(instance.isCheckedChange.emit).toHaveBeenCalledWith(true);
	});

	it("should not emit any value when the checkbox is clicked and it's disabled ", () => {
		spyOn(instance.isCheckedChange, 'emit');
		instance.disabled = true;
		instance.value = 'value';
		fixture.detectChanges();
		const checkbox = ngMocks.find('.checkbox-container').nativeElement;

		checkbox.click();

		expect(instance.isCheckedChange.emit).not.toHaveBeenCalled();
	});

	it('should have the primary class if the variant is set to primary', () => {
		instance.variant = 'primary';
		fixture.detectChanges();
		const checkbox = ngMocks.find('.checkbox-container').nativeElement;

		expect(checkbox.classList).toContain('checkbox-container-primary');
	});

	it('should have the secondary class if the variant is set to secondary', () => {
		instance.variant = 'secondary';
		fixture.detectChanges();
		const checkbox = ngMocks.find('.checkbox-container').nativeElement;

		expect(checkbox.classList).toContain('checkbox-container-secondary');
	});

	it('should be focusable and have correct ARIA attributes', () => {
		const checkboxContainer = ngMocks.find('.checkbox').nativeElement;

		expect(checkboxContainer.getAttribute('role')).toEqual('checkbox');
		expect(checkboxContainer.getAttribute('tabindex')).toEqual('0');
		expect(checkboxContainer.getAttribute('aria-checked')).toEqual('false');
		expect(checkboxContainer.getAttribute('aria-disabled')).toEqual('false');
	});

	it('should toggle checked state on Enter key press', () => {
		instance.isChecked = false;
		fixture.detectChanges();

		const checkboxContainer = ngMocks.find('.checkbox-container').nativeElement;
		const event = new KeyboardEvent('keydown', { key: 'Enter' });
		checkboxContainer.dispatchEvent(event);

		expect(instance.isChecked).toBeTruthy();
	});

	it('should toggle checked state on Space key press', () => {
		instance.isChecked = false;
		fixture.detectChanges();

		const checkboxContainer = ngMocks.find('.checkbox-container').nativeElement;
		const event = new KeyboardEvent('keydown', { key: ' ' });
		checkboxContainer.dispatchEvent(event);

		expect(instance.isChecked).toBeTruthy();
	});

	it('should not toggle checked state when disabled and Enter key is pressed', () => {
		instance.disabled = true;
		fixture.detectChanges();

		const checkboxContainer = ngMocks.find('.checkbox-container').nativeElement;
		const event = new KeyboardEvent('keydown', { key: 'Enter' });
		checkboxContainer.dispatchEvent(event);

		// Since the component is disabled, the isChecked state should not change
		expect(instance.isChecked).toBeFalsy();
	});

	it("should have aria-disabled set to 'true' when disabled", () => {
		instance.disabled = true;
		fixture.detectChanges();
		const checkboxContainer = ngMocks.find('.checkbox').nativeElement;

		expect(checkboxContainer.getAttribute('aria-disabled')).toEqual('true');
	});
});
