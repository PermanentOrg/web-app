import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlamUserSurveySquareComponent } from './glam-user-survey-square.component';

import { vi } from 'vitest';

@Component({
	selector: 'pr-checkbox',
	template: '',
	standalone: false,
})
class MockCheckboxComponent {
	@Input() isChecked: boolean;
	@Input() variant: string;
	@Input() onboarding: boolean;
}

describe('GlamUserSurveySquareComponent', () => {
	let component: GlamUserSurveySquareComponent;
	let fixture: ComponentFixture<GlamUserSurveySquareComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [GlamUserSurveySquareComponent, MockCheckboxComponent],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(GlamUserSurveySquareComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should display the text correctly', () => {
		const text = 'Test Text';
		component.text = text;
		fixture.detectChanges();
		const textElement = fixture.nativeElement.querySelector('.text');

		expect(textElement.textContent).toContain(text);
	});

	it('should toggle selected state and emit selectedChange when clicked', () => {
		const tag = 'test-tag';
		component.tag = tag;
		fixture.detectChanges();

		vi.spyOn(component.selectedChange, 'emit');

		const squareElement = fixture.nativeElement.querySelector('.square');
		squareElement.click();

		expect(component.selected).toBe(true);
		expect(component.selectedChange.emit).toHaveBeenCalledWith(tag);

		squareElement.click();

		expect(component.selected).toBe(false);
		expect(component.selectedChange.emit).toHaveBeenCalledWith(tag);
	});

	it('should add selected class when selected is true', () => {
		component.selected = true;
		fixture.detectChanges();

		const squareElement = fixture.nativeElement.querySelector('.square');

		expect(squareElement.classList.contains('selected')).toBe(true);
	});
});
