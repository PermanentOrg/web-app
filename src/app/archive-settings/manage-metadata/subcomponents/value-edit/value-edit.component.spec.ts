import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { TagVO } from '@models/tag-vo';
import { ApiService } from '@shared/services/api/api.service';
import { FormsModule } from '@angular/forms';
import {
	MessageService,
	MessageDisplayOptions,
} from '@shared/services/message/message.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { FormEditComponent } from '../form-edit/form-edit.component';
import { MetadataValuePipe } from '../../pipes/metadata-value.pipe';
import { ManageMetadataModule } from '../../manage-metadata.module';
import { EditValueComponent } from './value-edit.component';

describe('EditValueComponent', () => {
	let deleted: boolean;
	let updated: boolean;
	let newTagName: string;
	let error: boolean;
	let messageShown: boolean;
	let rejectDelete: boolean;

	beforeEach(async () => {
		updated = false;
		deleted = false;
		newTagName = '';
		error = false;
		messageShown = false;
		rejectDelete = false;

		await MockBuilder(EditValueComponent, ManageMetadataModule)
			.keep(FormsModule)
			.keep(FormEditComponent)
			.keep(MetadataValuePipe)
			.provide({
				provide: ApiService,
				useValue: {
					tag: {
						delete: async (tag: TagVO) => {
							if (error) {
								throw new Error('Test Error');
							}
							deleted = true;
						},
						update: async (tag: TagVO) => {
							if (error) {
								throw new Error('Test Error');
							}
							updated = true;
							newTagName = tag.name;
						},
					},
				},
			})
			.provide({
				provide: MessageService,
				useValue: {
					showError: (message: MessageDisplayOptions) => {
						messageShown = true;
					},
				},
			})
			.provide({
				provide: PromptService,
				useValue: {
					confirm: async () => {
						if (rejectDelete) {
							throw new Error('promise rejection');
						}
						return true;
					},
				},
			});
	});

	function defaultRender(
		tag: TagVO = new TagVO({ tagId: 1, name: 'abc:123' }),
	) {
		return MockRender(
			'<pr-metadata-edit-value [tag]="tag"></pr-metadata-edit-value>',
			{ tag },
		);
	}

	it('should create', () => {
		const fixture = defaultRender();

		expect(fixture.point.nativeElement).toBeTruthy();
	});

	it('should be able to delete a tag', async () => {
		defaultRender();
		const instance = ngMocks.findInstance(EditValueComponent);
		const refreshTagsSpy = spyOn(instance.refreshTags, 'emit');
		const deletedTagSpy = spyOn(instance.deletedTag, 'emit');

		await instance.delete();

		expect(deleted).toBeTrue();
		expect(refreshTagsSpy).toHaveBeenCalled();
		expect(deletedTagSpy).toHaveBeenCalled();
	});

	it('should be able to edit a value', async () => {
		defaultRender();
		const instance = ngMocks.findInstance(EditValueComponent);
		const refreshTagsSpy = spyOn(instance.refreshTags, 'emit');

		await instance.save('potato');

		expect(updated).toBeTrue();
		expect(newTagName).toBe('abc:potato');
		expect(refreshTagsSpy).toHaveBeenCalled();
	});

	it('should deal with errors while deleting', async () => {
		defaultRender();
		const instance = ngMocks.findInstance(EditValueComponent);
		const refreshTagsSpy = spyOn(instance.refreshTags, 'emit');

		error = true;
		await expectAsync(instance.delete()).toBeRejected();

		expect(messageShown).toBeTrue();
		expect(refreshTagsSpy).not.toHaveBeenCalled();
	});

	it('should deal with errors while editing', async () => {
		defaultRender();
		const instance = ngMocks.findInstance(EditValueComponent);
		const refreshTagsSpy = spyOn(instance.refreshTags, 'emit');

		error = true;
		await expectAsync(instance.save('test')).toBeRejected();

		expect(messageShown).toBeTrue();
		expect(refreshTagsSpy).not.toHaveBeenCalled();
	});

	it('should not do anything if they cancel out of the deletion confirmation prompt', async () => {
		rejectDelete = true;
		defaultRender();
		const instance = ngMocks.findInstance(EditValueComponent);
		const deletedTagSpy = spyOn(instance.deletedTag, 'emit');

		await instance.delete();

		expect(deletedTagSpy).not.toHaveBeenCalled();
	});
});
