import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { OnboardingService } from '@root/app/onboarding/services/onboarding.service';
import { NameArchiveScreenComponent } from './name-archive-screen.component';

describe('NameArchiveScreenComponent', () => {
	let component: NameArchiveScreenComponent;
	let fixture: ComponentFixture<NameArchiveScreenComponent>;
	const mockSessionStorage: { [key: string]: string } = {};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [NameArchiveScreenComponent],
			imports: [ReactiveFormsModule],
			providers: [OnboardingService],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		spyOn(sessionStorage, 'getItem').and.callFake(
			(key: string) => mockSessionStorage[key] || null,
		);
		spyOn(sessionStorage, 'setItem').and.callFake(
			(key: string, value: string) => {
				mockSessionStorage[key] = value;
			},
		);
		spyOn(sessionStorage, 'removeItem').and.callFake((key: string) => {
			delete mockSessionStorage[key];
		});

		// Clear the mock session storage before each test
		Object.keys(mockSessionStorage).forEach(
			(key) => delete mockSessionStorage[key],
		);

		fixture = TestBed.createComponent(NameArchiveScreenComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize with default values', () => {
		expect(component.nameForm).toBeTruthy();
		expect(component.nameForm.controls.archiveName.value).toBe('');
	});

	it('should patch the form value with input name on init', async () => {
		// Create a new fixture to test with different input
		const testFixture = TestBed.createComponent(NameArchiveScreenComponent);
		const testComponent = testFixture.componentInstance;
		testComponent.name = 'Test Archive';
		testFixture.detectChanges();

		expect(testComponent.nameForm.controls.archiveName.value).toBe(
			'Test Archive',
		);
	});

	it('should emit backToCreate event when backToCreate is called', () => {
		spyOn(component.backToCreateEmitter, 'emit');
		component.backToCreate();

		expect(component.backToCreateEmitter.emit).toHaveBeenCalledWith('create');
	});

	it('should emit archiveCreated event with form value when createArchive is called and form is valid', () => {
		spyOn(component.archiveCreatedEmitter, 'emit');
		component.nameForm.controls.archiveName.setValue('Valid Archive Name');
		component.createArchive();

		expect(component.archiveCreatedEmitter.emit).toHaveBeenCalledWith(
			'Valid Archive Name',
		);
	});

	it('should not emit archiveCreated event when createArchive is called and form is invalid', () => {
		spyOn(component.archiveCreatedEmitter, 'emit');
		component.nameForm.controls.archiveName.setValue('');
		component.createArchive();

		expect(component.archiveCreatedEmitter.emit).not.toHaveBeenCalled();
	});

	it('should call backToCreate when Back button is clicked', () => {
		spyOn(component, 'backToCreate');
		const backButton = fixture.debugElement.query(
			By.css('.back-button-component'),
		);
		backButton.triggerEventHandler('buttonClick', null);

		expect(component.backToCreate).toHaveBeenCalled();
	});

	it('should call createArchive when create archive button is clicked', () => {
		spyOn(component, 'createArchive');
		component.nameForm.controls.archiveName.setValue('Valid Archive Name');
		fixture.detectChanges();

		const createButton = fixture.debugElement.query(
			By.css('.create-archive-button'),
		);
		createButton.triggerEventHandler('buttonClick', null);

		expect(component.createArchive).toHaveBeenCalled();
	});

	it('should call createArchive when create archive button is clicked and form is valid', () => {
		component.nameForm.controls.archiveName.setValue('Valid Archive Name');
		fixture.detectChanges();

		spyOn(component, 'createArchive');

		const createButton = fixture.debugElement.query(
			By.css('.create-archive-button'),
		);

		createButton.triggerEventHandler('buttonClick', null);

		expect(component.createArchive).toHaveBeenCalled();
	});

	it('should initialize archiveName from sessionStorage if available', async () => {
		mockSessionStorage.archiveName = 'Stored Archive Name';

		// Create a new fixture to test with session storage value
		const testFixture = TestBed.createComponent(NameArchiveScreenComponent);
		const testComponent = testFixture.componentInstance;
		testFixture.detectChanges();

		expect(testComponent.nameForm.controls.archiveName.value).toBe(
			'Stored Archive Name',
		);
	});

	it('should update sessionStorage when archiveName value changes', () => {
		component.nameForm.controls.archiveName.setValue('Updated Archive Name');

		expect(sessionStorage.setItem).toHaveBeenCalledWith(
			'archiveName',
			'Updated Archive Name',
		);
	});
});
