import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FeatureFlagService } from '@root/app/feature-flag/services/feature-flag.service';
import { PasswordStrengthComponent } from './password-strength';

describe('PasswordStrengthComponent', () => {
	let component: PasswordStrengthComponent;
	let fixture: ComponentFixture<PasswordStrengthComponent>;
	let mockFeatureFlagService: jasmine.SpyObj<FeatureFlagService>;

	beforeEach(async () => {
		mockFeatureFlagService = jasmine.createSpyObj('FeatureFlagService', [
			'isEnabled',
		]);
		mockFeatureFlagService.isEnabled.and.returnValue(true);

		await TestBed.configureTestingModule({
			declarations: [PasswordStrengthComponent],
			providers: [
				{ provide: FeatureFlagService, useValue: mockFeatureFlagService },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(PasswordStrengthComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should display "weak" password strength correctly when feature flag is enabled', () => {
		component.password = '123';
		component.ngOnChanges();
		fixture.detectChanges();

		expect(component.strength).toBe('weak');
		expect(component.message).toBe('weak');
		expect(component.passwordClass).toBe('too-weak');
		expect(component.progressBars).toEqual(['weak', '', '']);

		const message = fixture.debugElement.query(By.css('p'));

		expect(message.nativeElement.textContent).toContain(
			'Password strength: weak',
		);
	});

	it('should display "medium" password strength correctly when feature flag is enabled', () => {
		component.password = 'password123';
		component.ngOnChanges();
		fixture.detectChanges();

		expect(component.strength).toBe('medium');
		expect(component.message).toBe('medium');
		expect(component.passwordClass).toBe('weak');
		expect(component.progressBars).toEqual(['half', 'half', '']);

		const message = fixture.debugElement.query(By.css('p'));

		expect(message.nativeElement.textContent).toContain(
			'Password strength: medium',
		);
	});

	it('should display "strong" password strength correctly when feature flag is enabled', () => {
		component.password = 'StrongPass123!';
		component.ngOnChanges();
		fixture.detectChanges();

		expect(component.strength).toBe('strong');
		expect(component.message).toBe('strong');
		expect(component.passwordClass).toBe('strong');
		expect(component.progressBars).toEqual(['filled', 'filled', 'filled']);

		const message = fixture.debugElement.query(By.css('p'));

		expect(message.nativeElement.textContent).toContain(
			'Password strength: strong',
		);
	});

	it('should not display anything when feature flag is disabled', () => {
		mockFeatureFlagService.isEnabled.and.returnValue(false);
		component.enabledPasswordCheckStrength = false;
		fixture.detectChanges();

		const container = fixture.debugElement.query(By.css('.strength-container'));

		expect(container).toBeNull();
	});
});
