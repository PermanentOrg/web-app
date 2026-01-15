import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { OnboardingService } from '@root/app/onboarding/services/onboarding.service';
import { ArchiveVO } from '@models/index';
import { AccessRolePipe } from '@shared/pipes/access-role.pipe';
import { FinalizeArchiveCreationScreenComponent } from './finalize-archive-creation-screen.component';

describe('FinalizeArchiveCreationScreenComponent', () => {
	let component: FinalizeArchiveCreationScreenComponent;
	let fixture: ComponentFixture<FinalizeArchiveCreationScreenComponent>;
	let onboardingService: OnboardingService;

	beforeEach(async () => {
		onboardingService = new OnboardingService();

		await TestBed.configureTestingModule({
			declarations: [FinalizeArchiveCreationScreenComponent, AccessRolePipe],
			providers: [{ provide: OnboardingService, useValue: onboardingService }],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(FinalizeArchiveCreationScreenComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should display the archive name correctly', () => {
		const name = 'John Doe';
		onboardingService.registerArchive(new ArchiveVO({ fullName: name }));

		// Recreate the fixture to pick up the registered archive
		fixture = TestBed.createComponent(FinalizeArchiveCreationScreenComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		const archiveNameElement =
			fixture.nativeElement.querySelector('.archive-info p');

		expect(archiveNameElement.textContent).toContain(`The ${name} Archive`);
	});

	it('it should display multiple archives with access roles correctly', () => {
		onboardingService.registerArchive(
			new ArchiveVO({ fullName: 'Unit Test', accessRole: 'access.role.owner' }),
		);
		onboardingService.registerArchive(
			new ArchiveVO({
				fullName: 'Unit Test 2',
				accessRole: 'access.role.editor',
			}),
		);
		onboardingService.registerArchive(
			new ArchiveVO({
				fullName: 'Unit Test 3',
				accessRole: 'access.role.viewer',
			}),
		);

		// Recreate the fixture to pick up the registered archives
		fixture = TestBed.createComponent(FinalizeArchiveCreationScreenComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		const archiveNameElements = fixture.nativeElement.querySelectorAll(
			'.archive-info .single-archive',
		);

		expect(archiveNameElements.length).toBe(3);
		expect(archiveNameElements[0].textContent).toContain('Unit Test Archive');
		expect(archiveNameElements[0].textContent).toContain('Owner');
	});

	it('should emit finalizeArchiveOutput when finalizeArchive is called', () => {
		spyOn(component.finalizeArchiveOutput, 'emit');
		component.finalizeArchive();

		expect(component.finalizeArchiveOutput.emit).toHaveBeenCalled();
	});

	it('should call finalizeArchive when the Done button is clicked', () => {
		const doneButton = fixture.debugElement.query(By.css('pr-button'));
		spyOn(component, 'finalizeArchive');
		doneButton.triggerEventHandler('buttonClick', null);

		expect(component.finalizeArchive).toHaveBeenCalled();
	});

	it('should disable the done button when it is clicked', () => {
		const doneButton = fixture.debugElement.query(By.css('pr-button'));
		doneButton.triggerEventHandler('buttonClick', null);

		fixture.detectChanges();

		expect(component.isArchiveSubmitted).toBe(true);
	});
});
