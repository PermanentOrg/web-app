import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { ApiService } from '@shared/services/api/api.service';
import {
	ArchiveFormData,
	NewArchiveFormComponent,
} from './new-archive-form.component';

let created: boolean = false;
let throwError: boolean = false;
let createdArchive: ArchiveFormData;

const mockApiService = {
	archive: {
		create: async (data: any) => {
			if (throwError) {
				throw 'Test Error';
			}
			created = true;
			createdArchive = data as ArchiveFormData;
			return {
				getArchiveVO: () => data,
			};
		},
	},
};

describe('NewArchiveFormComponent #onboarding', () => {
	let fixture;
	let instance: NewArchiveFormComponent;

	beforeEach(async () => {
		created = false;
		createdArchive = null;
		throwError = false;

		await MockBuilder(NewArchiveFormComponent, SharedModule)
			.keep(FormsModule)
			.mock(ApiService, mockApiService as any);

		fixture = TestBed.createComponent(NewArchiveFormComponent);
		instance = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(fixture.debugElement).not.toBeNull();
	});

	it('should not submit when form is invalid', () => {
		spyOn(instance.success, 'emit');
		spyOn(instance.errorOccurred, 'emit');

		expect(ngMocks.find('button').nativeElement.disabled).toBeFalsy();
		ngMocks.find('button').nativeElement.click();

		expect(instance.success.emit).not.toHaveBeenCalled();
		expect(instance.errorOccurred.emit).not.toHaveBeenCalled();
	});

	it('should disable button when form is waiting', () => {
		instance.waiting = true;
		fixture.detectChanges();

		expect(ngMocks.find('button').nativeElement.disabled).toBeTruthy();
	});

	it('should create a new archive on submit', async () => {
		// Set form data directly
		instance.formData = {
			fullName: 'Test User',
			type: 'type.archive.person',
		};
		// Mock isFormValid to bypass native validation check
		spyOn(instance, 'isFormValid').and.returnValue(true);
		fixture.detectChanges();
		// Call onSubmit directly
		await instance.onSubmit();

		expect(created).toBeTrue();
	});

	it('should output new archiveVO when submitted', async () => {
		spyOn(instance.success, 'emit');
		spyOn(instance.errorOccurred, 'emit');
		instance.formData = {
			fullName: 'Test User',
			type: 'type.archive.person',
			relationType: null,
		};
		spyOn(instance, 'isFormValid').and.returnValue(true);
		fixture.detectChanges();
		await instance.onSubmit();

		expect(instance.success.emit).toHaveBeenCalled();
		expect(createdArchive.fullName).toBe('Test User');
		expect(createdArchive.type).toBe('type.archive.person');
		expect(createdArchive.relationType).toBeNull();
		expect(instance.errorOccurred.emit).not.toHaveBeenCalled();
	});

	it('should output errors if they occur', async () => {
		throwError = true;
		spyOn(instance.success, 'emit');
		spyOn(instance.errorOccurred, 'emit');
		instance.formData = {
			fullName: 'Test User',
			type: 'type.archive.person',
		};
		spyOn(instance, 'isFormValid').and.returnValue(true);
		fixture.detectChanges();
		await instance.onSubmit();

		expect(instance.errorOccurred.emit).toHaveBeenCalled();
		expect(instance.success.emit).not.toHaveBeenCalled();
	});

	it('should have an input that enables relations', () => {
		// Use MockRender for template-based tests
		const renderFixture = MockRender(
			`<pr-new-archive-form [showRelations]="showRelations"></pr-new-archive-form>`,
			{ showRelations: true },
		);
		const componentInstance = ngMocks.find(NewArchiveFormComponent)
			.componentInstance as NewArchiveFormComponent;
		renderFixture.detectChanges();

		// Set form data to person type (shows relations)
		componentInstance.formData = {
			fullName: 'Test User',
			type: 'type.archive.person',
		};
		renderFixture.detectChanges();

		expect(ngMocks.findAll('select[name="relation"]')).toHaveFoundOne();

		// Change to group type (hides relations)
		componentInstance.formData.type = 'type.archive.group';
		renderFixture.detectChanges();

		expect(ngMocks.findAll('select[name="relation"]')).not.toHaveFoundOne();
	});

	it('should submit relationType to API if it is enabled', async () => {
		// Use MockRender for template-based tests
		const renderFixture = MockRender(
			`<pr-new-archive-form [showRelations]="showRelations"></pr-new-archive-form>`,
			{ showRelations: true },
		);
		const componentInstance = ngMocks.find(NewArchiveFormComponent)
			.componentInstance as NewArchiveFormComponent;
		renderFixture.detectChanges();

		// Set form data directly
		componentInstance.formData = {
			fullName: 'Test User',
			type: 'type.archive.person',
			relationType: 'relation.other',
		};
		spyOn(componentInstance, 'isFormValid').and.returnValue(true);
		renderFixture.detectChanges();
		await componentInstance.onSubmit();

		expect(createdArchive.relationType).toBe('relation.other');
	});
});
