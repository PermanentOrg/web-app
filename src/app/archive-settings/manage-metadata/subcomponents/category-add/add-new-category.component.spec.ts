import { MockBuilder, MockRender } from 'ng-mocks';
import { FormsModule } from '@angular/forms';
import { MessageService } from '@shared/services/message/message.service';
import { ApiService } from '@shared/services/api/api.service';
import { TagVOData } from '@models/tag-vo';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { FormCreateComponent } from '../form-create/form-create.component';
import { ManageMetadataModule } from '../../manage-metadata.module';
import { AddNewCategoryComponent } from './add-new-category.component';

describe('AddNewCategoryComponent', () => {
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
		await MockBuilder(AddNewCategoryComponent, ManageMetadataModule)
			.keep(FormsModule)
			.keep(FormCreateComponent)
			.provide({
				provide: PromptService,
				useValue: {
					prompt: async (message: string) => {
						if (acceptPrompt) {
							return { valueName: firstValueName };
						} else {
							throw new Error('Promise rejection from canceling out of Prompt');
						}
					},
				},
			})
			.provide({
				provide: MessageService,
				useValue: {
					showError: () => {
						messageShown = true;
					},
				},
			})
			.provide({
				provide: ApiService,
				useValue: {
					tag: {
						create: async (tag: TagVOData) => {
							if (error) {
								throw new Error('Test Error');
							}
							createdTag = tag;
						},
					},
				},
			});
	});

	it('should create', () => {
		const fixture = MockRender(AddNewCategoryComponent);

		expect(fixture.point.nativeElement).not.toBeNull();
	});

	it('should be able to create a new category', async () => {
		const fixture = MockRender(AddNewCategoryComponent);
		const instance = fixture.point.componentInstance;
		const tagsUpdateSpy = spyOn(instance.tagsUpdate, 'emit');
		const newCategorySpy = spyOn(instance.newCategory, 'emit');

		firstValueName = 'potato';
		await instance.createNewCategory('vegetable');

		expect(createdTag.name).toBe('vegetable:potato');
		expect(tagsUpdateSpy).toHaveBeenCalled();
		expect(newCategorySpy).toHaveBeenCalledWith('vegetable');
	});

	it('should reject category names containing a : character', async () => {
		const fixture = MockRender(AddNewCategoryComponent);
		const instance = fixture.point.componentInstance;

		firstValueName = 'test';
		await expectAsync(instance.createNewCategory('a:b')).toBeRejected();

		expect(createdTag).toBeNull();
		expect(messageShown).toBeTrue();
	});

	it('should be able to cancel out of creating a category', async () => {
		const fixture = MockRender(AddNewCategoryComponent);
		const instance = fixture.point.componentInstance;
		const tagsUpdateSpy = spyOn(instance.tagsUpdate, 'emit');

		acceptPrompt = false;
		firstValueName = 'test';
		await instance.createNewCategory('test');

		expect(createdTag).toBeNull();
		expect(tagsUpdateSpy).not.toHaveBeenCalled();
	});

	it('should show an error message when it errors out', async () => {
		const fixture = MockRender(AddNewCategoryComponent);
		const instance = fixture.point.componentInstance;
		const tagsUpdateSpy = spyOn(instance.tagsUpdate, 'emit');

		error = true;
		firstValueName = 'potato';
		await expectAsync(instance.createNewCategory('abc')).toBeRejected();

		expect(createdTag).toBeNull();
		expect(messageShown).toBeTrue();
		expect(tagsUpdateSpy).not.toHaveBeenCalled();
	});
});
