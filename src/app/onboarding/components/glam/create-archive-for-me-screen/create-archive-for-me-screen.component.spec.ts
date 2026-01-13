import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AccountService } from '@shared/services/account/account.service';
import { OnboardingService } from '@root/app/onboarding/services/onboarding.service';
import { CreateArchiveForMeScreenComponent } from './create-archive-for-me-screen.component';

const mockAccountService = {
	getAccount: () => ({ fullName: 'John Doe' }),
};

describe('CreateArchiveForMeScreenComponent', () => {
	let component: CreateArchiveForMeScreenComponent;
	let fixture: ComponentFixture<CreateArchiveForMeScreenComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CreateArchiveForMeScreenComponent],
			providers: [
				{ provide: AccountService, useValue: mockAccountService },
				OnboardingService,
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(CreateArchiveForMeScreenComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize name with the account full name', () => {
		expect(component.name).toBe('John Doe');
	});

	it('should render the archive name in the template', () => {
		const archiveNameElement =
			fixture.nativeElement.querySelector('.archive-name');

		expect(archiveNameElement.textContent).toContain('John Doe');
	});

	it('should emit goBackOutput when the Back button is clicked', () => {
		spyOn(component.goBackOutput, 'emit');
		const backButton = fixture.debugElement.query(By.css('.back'));

		backButton.triggerEventHandler('buttonClick', null);

		expect(component.goBackOutput.emit).toHaveBeenCalledWith('start');
	});

	it('should emit continueOutput with correct payload when the Yes, create archive button is clicked', () => {
		spyOn(component.continueOutput, 'emit');
		const continueButton = fixture.debugElement.query(By.css('.continue'));

		continueButton.triggerEventHandler('buttonClick', null);

		expect(component.continueOutput.emit).toHaveBeenCalledWith({
			screen: 'goals',
			type: 'type.archive.person',
			name: 'John Doe',
		});
	});
});
