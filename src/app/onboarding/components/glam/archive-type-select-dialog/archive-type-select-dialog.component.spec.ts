import { DialogCloseOptions, DialogRef } from '@angular/cdk/dialog';
import { Shallow } from 'shallow-render';
import { archiveOptions } from '../types/archive-types';
import { ArchiveTypeSelectDialogComponent } from './archive-type-select-dialog.component';

describe('ArchiveTypeSelectDialogComponent', () => {
	let shallow: Shallow<ArchiveTypeSelectDialogComponent>;

	beforeEach(() => {
		shallow = new Shallow(ArchiveTypeSelectDialogComponent)
			.provide({
				provide: DialogRef,
				useValue: {
					close() {},
				},
			})
			.dontMock(DialogRef);
	});

	it('should create', async () => {
		const { instance } = await shallow.render();

		expect(instance).toBeTruthy();
	});

	it('should have multiple options for archive types', async () => {
		const { find } = await shallow.render();

		expect(find('.archive-type').length).toEqual(archiveOptions.length);
	});

	it('should close the dialog and return type when clicking a type', async () => {
		const { find, inject } = await shallow.render();
		const dialogRef = inject(DialogRef);
		const close = spyOn(dialogRef, 'close');
		find('#type-myself').nativeElement.click();
		find('#type-org').nativeElement.click();

		expect(close).toHaveBeenCalledWith('type:myself');
		expect(close).toHaveBeenCalledWith('type:org');
	});
});
