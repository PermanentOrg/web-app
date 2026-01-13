import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountService } from '@shared/services/account/account.service';
import { Router } from '@angular/router';
import { GlamOnboardingHeaderComponent } from './glam-header.component';

const mockAccountService = {
	clear: jasmine.createSpy('clear'),
};

const mockRouter = {
	navigate: jasmine.createSpy('navigate').and.resolveTo(true),
};

describe('GlamHeaderComponent', () => {
	let component: GlamOnboardingHeaderComponent;
	let fixture: ComponentFixture<GlamOnboardingHeaderComponent>;

	beforeEach(async () => {
		mockAccountService.clear.calls.reset();
		mockRouter.navigate.calls.reset();

		await TestBed.configureTestingModule({
			declarations: [GlamOnboardingHeaderComponent],
			providers: [
				{ provide: AccountService, useValue: mockAccountService },
				{ provide: Router, useValue: mockRouter },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(GlamOnboardingHeaderComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('can log out the user', () => {
		const logoutButton =
			fixture.nativeElement.querySelector('.actions .log-out');
		logoutButton.click();

		expect(mockAccountService.clear).toHaveBeenCalled();
		expect(mockRouter.navigate).toHaveBeenCalled();
	});
});
