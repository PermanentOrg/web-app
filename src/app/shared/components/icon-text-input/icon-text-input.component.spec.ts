import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { faHouse } from '@fortawesome/pro-regular-svg-icons';
import { IconTextInputComponent } from './icon-text-input.component';

@Component({
	standalone: true,
	imports: [IconTextInputComponent],
	template: `<pr-icon-text-input
		[icon]="icon"
		label="Name"
		[value]="value"
		[disabled]="disabled"
		(valueChange)="onValueChange($event)"
	/>`,
})
class TestHostComponent {
	icon = faHouse;
	value = '';
	disabled = false;
	lastEmittedValue: string | null = null;

	onValueChange(newValue: string): void {
		this.lastEmittedValue = newValue;
		this.value = newValue;
	}
}

describe('IconTextInputComponent', () => {
	let hostComponent: TestHostComponent;
	let fixture: ComponentFixture<TestHostComponent>;

	const getInput = (): HTMLInputElement =>
		fixture.nativeElement.querySelector('.pr-icon-text-input-control');

	const getClearButton = (): HTMLButtonElement =>
		fixture.nativeElement.querySelector('.pr-icon-text-input-clear');

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [TestHostComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(TestHostComponent);
		hostComponent = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should render the icon and label', () => {
		const icon = fixture.nativeElement.querySelector(
			'.pr-icon-text-input-icon svg',
		);

		expect(icon.getAttribute('data-icon')).toBe('house');
		expect(getInput().placeholder).toBe('Name');
		expect(getInput().getAttribute('aria-label')).toBe('Name');
	});

	it('should paint the icon with the gradient', () => {
		const path: SVGPathElement = fixture.nativeElement.querySelector(
			'.pr-icon-text-input-icon svg path',
		);

		expect(getComputedStyle(path).fill).toContain('pr-icon-gradient');
	});

	it('should emit the typed value', () => {
		const input = getInput();
		input.value = 'My old house';
		input.dispatchEvent(new Event('input'));

		expect(hostComponent.lastEmittedValue).toBe('My old house');
	});

	it('should show the current value', () => {
		hostComponent.value = 'Paris';
		fixture.detectChanges();

		expect(getInput().value).toBe('Paris');
	});

	it('should disable the input when disabled', () => {
		hostComponent.disabled = true;
		fixture.detectChanges();

		expect(getInput().disabled).toBeTrue();
	});

	it('should offer no clear button while the field is empty', () => {
		expect(getClearButton()).toBeNull();
	});

	it('should keep the clear button out of reach until the field is focused', () => {
		hostComponent.value = 'Paris';
		fixture.detectChanges();

		expect(getComputedStyle(getClearButton()).display).toBe('none');

		getInput().focus();

		expect(getComputedStyle(getClearButton()).display).toBe('flex');
	});

	it('should keep focus on the field while the clear button is pressed', () => {
		hostComponent.value = 'Paris';
		fixture.detectChanges();

		const mousedown = new MouseEvent('mousedown', {
			bubbles: true,
			cancelable: true,
		});
		getClearButton().dispatchEvent(mousedown);

		expect(mousedown.defaultPrevented).toBeTrue();
	});

	it('should emit an empty value when cleared', () => {
		hostComponent.value = 'Paris';
		fixture.detectChanges();

		getClearButton().click();

		expect(hostComponent.lastEmittedValue).toBe('');
	});

	it('should label the clear button with the field it clears', () => {
		hostComponent.value = 'Paris';
		fixture.detectChanges();

		expect(getClearButton().getAttribute('aria-label')).toBe('Clear Name');
	});
});
