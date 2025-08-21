import { Shallow } from 'shallow-render';
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
	let shallow: Shallow<NewArchiveFormComponent>;
	function fillOutForm(find: (a: string) => any) {
		const input = find('#newArchiveName');
		input.nativeElement.value = 'Test User';
		input.triggerEventHandler('input', { target: input.nativeElement });
		const radio = find('input[type="radio"][required]');
		radio.nativeElement.click();
	}
	beforeEach(() => {
		created = false;
		createdArchive = null;
		throwError = false;
		//I hate to do this but I don't have time to mock out the entire API service in a type-safe way.
		//@ts-ignore
		shallow = new Shallow(NewArchiveFormComponent, SharedModule).mock(
			ApiService,
			mockApiService,
		);
	});

	it('should create', async () => {
		const { element } = await shallow.render();

		expect(element).not.toBeNull();
	});

	it('should not submit when form is invalid', async () => {
		const { find, outputs } = await shallow.render();

		expect(find('button').nativeElement.disabled).toBeFalsy();
		find('button').nativeElement.click();

		expect(outputs.success.emit).not.toHaveBeenCalled();
		expect(outputs.error.emit).not.toHaveBeenCalled();
	});

	it('should disable button when form is waiting', async () => {
		const { find, fixture } = await shallow.render();
		fillOutForm(find);
		fixture.detectChanges();
		find('button').nativeElement.click();
		fixture.detectChanges();

		expect(find('button').nativeElement.disabled).toBeTruthy();
	});

	it('should create a new archive on submit', async () => {
		const { find, fixture } = await shallow.render();
		fillOutForm(find);
		fixture.detectChanges();
		find('button').nativeElement.click();
		fixture.detectChanges();

		expect(created).toBeTrue();
	});

	it('should output new archiveVO when submitted', async () => {
		const { find, fixture, outputs } = await shallow.render();
		fillOutForm(find);
		fixture.detectChanges();
		find('button').nativeElement.click();
		await fixture.whenStable();

		expect(outputs.success.emit).toHaveBeenCalled();
		expect(createdArchive.fullName).toBe('Test User');
		expect(createdArchive.type).toBe('type.archive.person');
		expect(createdArchive.relationType).toBeNull();
		expect(outputs.error.emit).not.toHaveBeenCalled();
	});

	it('should output errors if they occur', async () => {
		throwError = true;
		const { find, fixture, outputs } = await shallow.render();
		fillOutForm(find);
		fixture.detectChanges();
		find('button').nativeElement.click();
		await fixture.whenStable();

		expect(outputs.error.emit).toHaveBeenCalled();
		expect(outputs.success.emit).not.toHaveBeenCalled();
	});

	it('should have an input that enables relations', async () => {
		const { find, fixture } = await shallow.render(
			'<pr-new-archive-form [showRelations]="true"></pr-new-archive-form>',
		);
		fillOutForm(find);
		fixture.detectChanges();

		expect(find('select[name="relation"]')).toHaveFoundOne();
		find('input[type="radio"]')[1].nativeElement.click();
		fixture.detectChanges();

		expect(find('select[name="relation"]')).not.toHaveFoundOne();
	});

	it('should submit relationType to API if it is enabled', async () => {
		const { element, find, fixture } = await shallow.render(
			'<pr-new-archive-form [showRelations]="true"></pr-new-archive-form>',
		);
		fillOutForm(find);
		fixture.detectChanges();
		find('select').nativeElement.value = 'relation.other';
		element.componentInstance.formData.relationType = 'relation.other';
		find('button').nativeElement.click();
		await fixture.whenStable();

		expect(createdArchive.relationType).toBe('relation.other');
	});
});
