import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { TagVO } from '@models/tag-vo';
import { ApiService } from '@shared/services/api/api.service';
import {
	MessageService,
	MessageDisplayOptions,
} from '@shared/services/message/message.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { FormEditComponent } from '../form-edit/form-edit.component';
import { ManageMetadataModule } from '../../manage-metadata.module';
import { CategoryEditComponent } from './category-edit.component';

describe('CategoryEditComponent', () => {
	let category: string;
	let tags: TagVO[];
	let deletedTags: TagVO[];
	let savedTags: TagVO[];
	let error: boolean;
	let messageShown: boolean;
	let rejectDelete: boolean;

	beforeEach(async () => {
		category = 'test';
		tags = [
			new TagVO({
				tagId: 1,
				name: 'potato',
				type: 'type.tag.generic.placeholder',
			}),
			new TagVO({
				tagId: 2,
				name: 'test:abc',
				type: 'type.tag.metadata.customField',
			}),
			new TagVO({
				tagId: 3,
				name: 'test',
				type: 'type.tag.generic.placeholder',
			}),
			new TagVO({
				tagId: 4,
				name: 'test:test:123',
				type: 'type.tag.metadata.customField',
			}),
			new TagVO({
				tagId: 5,
				name: 'abc:123',
				type: 'type.tag.metadata.customField',
			}),
		];
		deletedTags = [];
		savedTags = [];
		error = false;
		messageShown = false;
		rejectDelete = false;
		await MockBuilder(CategoryEditComponent, ManageMetadataModule)
			.keep(FormEditComponent)
			.provide({
				provide: ApiService,
				useValue: {
					tag: {
						update: async (tag: TagVO[]) => {
							if (error) {
								throw new Error('Test Error');
							}
							savedTags = savedTags.concat(tag);
						},
						delete: async (tag: TagVO[]) => {
							if (error) {
								throw new Error('Test Error');
							}
							deletedTags = deletedTags.concat(tag);
						},
					},
				},
			})
			.provide({
				provide: MessageService,
				useValue: {
					showError: async (msg: MessageDisplayOptions) => {
						messageShown = true;
					},
				},
			})
			.provide({
				provide: PromptService,
				useValue: {
					confirm: async () => {
						if (rejectDelete) {
							throw new Error('Rejected delete');
						}
						return true;
					},
				},
			});
	});

	function defaultRender() {
		return MockRender(
			'<pr-metadata-category-edit [category]="category" [tags]="tags"></pr-metadata-category-edit>',
			{ category, tags },
		);
	}

	it('should exist', () => {
		const fixture = defaultRender();

		expect(fixture.point.nativeElement).not.toBeNull();
	});

	it('should be able to delete a category', async () => {
		defaultRender();
		const instance = ngMocks.findInstance(CategoryEditComponent);
		const refreshTagsSpy = spyOn(instance.refreshTags, 'emit');
		const deletedCategorySpy = spyOn(instance.deletedCategory, 'emit');

		await instance.delete();

		expect(deletedTags.length).toBe(2);
		expect(deletedTags[0].name).toContain('test');
		expect(deletedTags[1].name).toContain('test');
		expect(refreshTagsSpy).toHaveBeenCalled();
		expect(deletedCategorySpy).toHaveBeenCalledWith('test');
	});

	it('should deal with errors while deleting', async () => {
		defaultRender();
		const instance = ngMocks.findInstance(CategoryEditComponent);
		const refreshTagsSpy = spyOn(instance.refreshTags, 'emit');
		const deletedCategorySpy = spyOn(instance.deletedCategory, 'emit');

		error = true;
		await expectAsync(instance.delete()).toBeRejected();

		expect(messageShown).toBeTrue();
		expect(refreshTagsSpy).not.toHaveBeenCalled();
		expect(deletedCategorySpy).not.toHaveBeenCalled();
	});

	it('should be able to save a category', async () => {
		defaultRender();
		const instance = ngMocks.findInstance(CategoryEditComponent);
		const refreshTagsSpy = spyOn(instance.refreshTags, 'emit');

		await instance.save('potato');

		expect(savedTags.length).toBe(2);
		savedTags.forEach((tag) => {
			expect(tag.name.startsWith('potato')).toBeTrue(); // Verify category name changed
			expect(tag.name.substring(6).includes('potato')).toBeFalse(); // Verify value name not changed
		});

		expect(refreshTagsSpy).toHaveBeenCalled();
	});

	it('should deal with errors while saving', async () => {
		defaultRender();
		const instance = ngMocks.findInstance(CategoryEditComponent);
		const refreshTagsSpy = spyOn(instance.refreshTags, 'emit');

		error = true;
		await expectAsync(instance.save('potato')).toBeRejected();

		expect(messageShown).toBeTrue();
		expect(refreshTagsSpy).not.toHaveBeenCalled();
	});

	it('should not do anything if they cancel out of the deletion confirmation prompt', async () => {
		rejectDelete = true;
		defaultRender();
		const instance = ngMocks.findInstance(CategoryEditComponent);
		const deletedCategorySpy = spyOn(instance.deletedCategory, 'emit');

		await instance.delete();

		expect(deletedTags.length).toBe(0);
		expect(deletedCategorySpy).not.toHaveBeenCalled();
	});
});
