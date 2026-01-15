import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockBuilder, ngMocks } from 'ng-mocks';
import { ComponentsModule } from '../../components.module';
import { ToggleComponent } from './toggle.component';

describe('ToggleComponent', () => {
	let fixture: ComponentFixture<ToggleComponent>;
	let instance: ToggleComponent;

	beforeEach(async () => {
		await MockBuilder(ToggleComponent, ComponentsModule);

		fixture = TestBed.createComponent(ToggleComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(instance).toBeTruthy();
	});

	it('should have the checked class when the toggle is checked', () => {
		instance.isChecked = true;
		fixture.detectChanges();
		const toggle = ngMocks.find('.toggle-container').nativeElement;

		expect(toggle.classList).toContain('checked');
	});

	it('should have the disabled class when the toggle is disabled', () => {
		instance.disabled = true;
		fixture.detectChanges();
		const toggle = ngMocks.find('.toggle-container').nativeElement;

		expect(toggle.classList).toContain('disabled');
	});

	it('should emit the correct value when the toggle is clicked', () => {
		spyOn(instance.isCheckedChange, 'emit');
		fixture.detectChanges();
		const toggle = ngMocks.find('.toggle-container').nativeElement;
		toggle.click();

		expect(instance.isCheckedChange.emit).toHaveBeenCalledWith(true);

		instance.isChecked = true;
		fixture.detectChanges();
		toggle.click();

		expect(instance.isCheckedChange.emit).toHaveBeenCalledWith(false);
	});

	it('should not emit when the toggle is disabled', () => {
		spyOn(instance.isCheckedChange, 'emit');
		instance.disabled = true;
		fixture.detectChanges();
		const toggle = ngMocks.find('.toggle-container').nativeElement;
		toggle.click();

		expect(instance.isCheckedChange.emit).not.toHaveBeenCalled();
	});
});
