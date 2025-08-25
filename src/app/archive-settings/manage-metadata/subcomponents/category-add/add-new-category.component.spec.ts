import { Shallow } from 'shallow-render';
import { FormsModule } from '@angular/forms';
import { MessageService } from '@shared/services/message/message.service';
import { ApiService } from '@shared/services/api/api.service';
import { TagVOData } from '@models/tag-vo';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { FormCreateComponent } from '../form-create/form-create.component';
import { ManageMetadataModule } from '../../manage-metadata.module';
import { AddNewCategoryComponent } from './add-new-category.component';

describe('AddNewCategoryComponent', () => {
	let shallow: Shallow<AddNewCategoryComponent>;
	let createdTag: TagVOData = null;
	let error = false;
	let messageShown = false;
	let acceptPrompt = true;
	let firstValueName: string;

	beforeEach(async () => {
		createdTag = null;
		error = false;
		messageShown = false;
		acceptPrompt = true;
		firstValueName = null;
		shallow = new Shallow(AddNewCategoryComponent, ManageMetadataModule)
			.import(FormsModule)
			.dontMock(FormCreateComponent)
			.mock(PromptService, {
				prompt: async (message: string) => {
					if (acceptPrompt) {
						return { valueName: firstValueName };
					} else {
						throw new Error('Promise rejection from canceling out of Prompt');
					}
				},
			})
			.mock(MessageService, {
				showError: () => {
					messageShown = true;
				},
			})
			.mock(ApiService, {
				tag: {
					create: async (tag: TagVOData) => {
						if (error) {
							throw new Error('Test Error');
						}
						createdTag = tag;
					},
				},
			});
	});

	it('should create', async () => {
		const { element } = await shallow.render();

		expect(element).not.toBeNull();
	});

	it('should be able to create a new category', async () => {
		const { instance, outputs } = await shallow.render();
		firstValueName = 'potato';
		await instance.createNewCategory('vegetable');

		expect(createdTag.name).toBe('vegetable:potato');
		expect(outputs.tagsUpdate.emit).toHaveBeenCalled();
		expect(outputs.newCategory.emit).toHaveBeenCalledWith('vegetable');
	});

	it('should reject category names containing a : character', async () => {
		const { instance } = await shallow.render();
		firstValueName = 'test';
		await expectAsync(instance.createNewCategory('a:b')).toBeRejected();

		expect(createdTag).toBeNull();
		expect(messageShown).toBeTrue();
	});

	it('should be able to cancel out of creating a category', async () => {
		const { instance, outputs } = await shallow.render();
		acceptPrompt = false;
		firstValueName = 'test';
		await instance.createNewCategory('test');

		expect(createdTag).toBeNull();
		expect(outputs.tagsUpdate.emit).not.toHaveBeenCalled();
	});

	it('should show an error message when it errors out', async () => {
		const { instance, outputs } = await shallow.render();
		error = true;
		firstValueName = 'potato';
		await expectAsync(instance.createNewCategory('abc')).toBeRejected();

		expect(createdTag).toBeNull();
		expect(messageShown).toBeTrue();
		expect(outputs.tagsUpdate.emit).not.toHaveBeenCalled();
	});
});
