import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AccountService } from '@shared/services/account/account.service';
import { ArchiveCreationStartScreenComponent } from './archive-creation-start-screen.component';

const mockAccountService = {
	getAccount: () => ({ fullName: 'John Doe' }),
};

describe('ArchiveCreationStartScreenComponent', () => {
	let component: ArchiveCreationStartScreenComponent;
	let fixture: ComponentFixture<ArchiveCreationStartScreenComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ArchiveCreationStartScreenComponent],
			providers: [{ provide: AccountService, useValue: mockAccountService }],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(ArchiveCreationStartScreenComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize with the account name', () => {
		expect(component.name).toBe('John Doe');
	});

	it('should render the account name in the greeting', () => {
		const greetingElement = fixture.debugElement.query(
			By.css('.greetings-container b'),
		).nativeElement;

		expect(greetingElement.textContent).toContain('John Doe');
	});

	it('should emit getStartedOutput event when Get Started button is clicked', () => {
		spyOn(component, 'getStarted').and.callThrough();
		spyOn(component.getStartedOutput, 'emit');

		const getStartedButton = fixture.debugElement.query(By.css('.get-started'));

		getStartedButton.triggerEventHandler('buttonClick', null);

		expect(component.getStarted).toHaveBeenCalled();
		expect(component.getStartedOutput.emit).toHaveBeenCalled();
	});

	it('should emit createArchiveForMeOutput event when Create Archive for Me button is clicked', () => {
		spyOn(component, 'createArchiveForMe').and.callThrough();
		spyOn(component.createArchiveForMeOutput, 'emit');

		const createArchiveButton = fixture.debugElement.query(
			By.css('.create-archive-for-me'),
		);
		createArchiveButton.triggerEventHandler('buttonClick', null);

		expect(component.createArchiveForMe).toHaveBeenCalled();
		expect(component.createArchiveForMeOutput.emit).toHaveBeenCalled();
	});

	it('should set hasToken to true if there is a token in the local storage', () => {
		spyOn(localStorage, 'getItem').and.returnValue('someToken');

		component.ngOnInit();
		fixture.detectChanges();

		expect(component.hasShareToken).toBeTrue();
	});

	it('should not set hasShareToken if shareToken does not exist in localStorage', () => {
		spyOn(localStorage, 'getItem').and.returnValue(null);

		component.ngOnInit();
		fixture.detectChanges();

		expect(component.hasShareToken).toBeFalse();
	});
});
