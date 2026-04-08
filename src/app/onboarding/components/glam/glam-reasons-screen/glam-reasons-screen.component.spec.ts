import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { reasons } from '../../../shared/onboarding-screen';
import { OnboardingService } from '../../../services/onboarding.service';
import { GlamReasonsScreenComponent } from './glam-reasons-screen.component';

import { vi } from 'vitest';

describe('GlamReasonsScreenComponent', () => {
	let component: GlamReasonsScreenComponent;
	let fixture: ComponentFixture<GlamReasonsScreenComponent>;
	let onboardingService: OnboardingService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [GlamReasonsScreenComponent],
			providers: [OnboardingService],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		onboardingService = TestBed.inject(OnboardingService);
		vi.spyOn(onboardingService, 'getReasons').mockReturnValue(['Mock Reason']);
		vi.spyOn(onboardingService, 'setReasons');

		fixture = TestBed.createComponent(GlamReasonsScreenComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize reasons from shared/onboarding-screen', () => {
		expect(component.reasons).toEqual(reasons);
	});

	it('should initialize selectedReasons from OnboardingService', () => {
		expect(onboardingService.getReasons).toHaveBeenCalled();
		expect(component.selectedReasons).toEqual(['Mock Reason']);
	});

	it('should update reasons via OnboardingService when addReason is called', () => {
		const reason = 'Test Reason';

		component.addReason(reason);

		expect(onboardingService.setReasons).toHaveBeenCalledWith([
			'Mock Reason',
			'Test Reason',
		]);
	});

	it('should add reason to selectedReasons when addReason is called', () => {
		const reason = 'Test Reason';
		component.addReason(reason);

		expect(component.selectedReasons).toContain(reason);
	});

	it('should remove reason from selectedReasons when addReason is called twice', () => {
		const reason = 'Test Reason';
		component.addReason(reason);
		component.addReason(reason);

		expect(component.selectedReasons).not.toContain(reason);
	});

	it('should emit reasonsEmit with selectedReasons when finalizeArchive is called', () => {
		vi.spyOn(component.reasonsEmit, 'emit');
		const reason = 'Test Reason';
		component.addReason(reason);
		component.finalizeArchive();

		expect(component.reasonsEmit.emit).toHaveBeenCalledWith({
			screen: 'finalize',
			reasons: ['Mock Reason', reason],
		});
	});

	it('should emit reasonsEmit with selectedReasons when backToGoals is called', () => {
		vi.spyOn(component.reasonsEmit, 'emit');
		const reason = 'Test Reason';
		component.addReason(reason);
		component.backToGoals();

		expect(component.reasonsEmit.emit).toHaveBeenCalledWith({
			screen: 'goals',
			reasons: ['Mock Reason', reason],
		});
	});

	it('should clear selectedReasons and update via OnboardingService when skipStep is called', () => {
		expect(component.selectedReasons).toEqual(['Mock Reason']);

		component.skipStep();

		expect(component.selectedReasons).toEqual([]);
		expect(onboardingService.setReasons).toHaveBeenCalledWith([]);
	});

	it('should emit reasonOutput with empty reasons when skipStep is called', () => {
		vi.spyOn(component.reasonsEmit, 'emit');

		component.skipStep();

		expect(component.reasonsEmit.emit).toHaveBeenCalledWith({
			screen: 'finalize',
			reasons: [],
		});
	});
});
