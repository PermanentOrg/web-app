import { Shallow } from 'shallow-render';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { OnboardingService } from '@root/app/onboarding/services/onboarding.service';
import { OnboardingModule } from '../../../onboarding.module';
import { NameArchiveScreenComponent } from './name-archive-screen.component';

describe('NameArchiveScreenComponent', () => {
	let shallow: Shallow<NameArchiveScreenComponent>;
	const mockSessionStorage: { [key: string]: string } = {};

	beforeEach(async () => {
		shallow = new Shallow(NameArchiveScreenComponent, OnboardingModule)
			.import(ReactiveFormsModule)
			.provide(OnboardingService)
			.dontMock(OnboardingService);

		spyOn(sessionStorage, 'getItem').and.callFake((key: string) => {
			return mockSessionStorage[key] || null;
		});
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
	});

	it('should create', async () => {
		const { instance } = await shallow.render();

		expect(instance).toBeTruthy();
	});

	it('should initialize with default values', async () => {
		const { instance } = await shallow.render();

		expect(instance.nameForm).toBeTruthy();
		expect(instance.nameForm.controls.archiveName.value).toBe('');
	});

	it('should patch the form value with input name on init', async () => {
		const { instance } = await shallow.render({
			bind: { name: 'Test Archive' },
		});

		expect(instance.nameForm.controls.archiveName.value).toBe('Test Archive');
	});

	it('should emit backToCreate event when backToCreate is called', async () => {
		const { instance, outputs } = await shallow.render();
		instance.backToCreate();

		expect(outputs.backToCreateEmitter.emit).toHaveBeenCalledWith('create');
	});

	it('should emit archiveCreated event with form value when createArchive is called and form is valid', async () => {
		const { instance, outputs } = await shallow.render();
		instance.nameForm.controls.archiveName.setValue('Valid Archive Name');
		instance.createArchive();

		expect(outputs.archiveCreatedEmitter.emit).toHaveBeenCalledWith(
			'Valid Archive Name',
		);
	});

	it('should not emit archiveCreated event when createArchive is called and form is invalid', async () => {
		const { instance, outputs } = await shallow.render();
		instance.nameForm.controls.archiveName.setValue('');
		instance.createArchive();

		expect(outputs.archiveCreatedEmitter.emit).not.toHaveBeenCalled();
	});

	it('should call backToCreate when Back button is clicked', async () => {
		const { fixture, instance } = await shallow.render();
		spyOn(instance, 'backToCreate');
		const backButton = fixture.debugElement.query(
			By.css('.back-button-component'),
		);
		backButton.triggerEventHandler('buttonClick', null);

		expect(instance.backToCreate).toHaveBeenCalled();
	});

	it('should call createArchive when create archive button is clicked', async () => {
		const { fixture, instance } = await shallow.render();
		spyOn(instance, 'createArchive');
		instance.nameForm.controls.archiveName.setValue('Valid Archive Name');
		fixture.detectChanges();

		const createButton = fixture.debugElement.query(
			By.css('.create-archive-button'),
		);
		createButton.triggerEventHandler('buttonClick', null);

		expect(instance.createArchive).toHaveBeenCalled();
	});

	it('should call createArchive when create archive button is clicked and form is valid', async () => {
		const { fixture, instance } = await shallow.render();
		instance.nameForm.controls.archiveName.setValue('Valid Archive Name');
		fixture.detectChanges();

		spyOn(instance, 'createArchive');

		const createButton = fixture.debugElement.query(
			By.css('.create-archive-button'),
		);

		createButton.triggerEventHandler('buttonClick', null);

		expect(instance.createArchive).toHaveBeenCalled();
	});

	it('should initialize archiveName from sessionStorage if available', async () => {
		mockSessionStorage.archiveName = 'Stored Archive Name';
		const { instance } = await shallow.render();

		expect(instance.nameForm.controls.archiveName.value).toBe(
			'Stored Archive Name',
		);
	});

	it('should update sessionStorage when archiveName value changes', async () => {
		const { instance } = await shallow.render();
		instance.nameForm.controls.archiveName.setValue('Updated Archive Name');

		expect(sessionStorage.setItem).toHaveBeenCalledWith(
			'archiveName',
			'Updated Archive Name',
		);
	});
});
