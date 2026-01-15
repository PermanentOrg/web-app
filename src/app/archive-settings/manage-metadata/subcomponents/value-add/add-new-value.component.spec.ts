import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { FormsModule } from '@angular/forms';
import { MessageService } from '@shared/services/message/message.service';
import { ApiService } from '@shared/services/api/api.service';
import { TagVOData } from '@models/tag-vo';
import { ManageMetadataModule } from '../../manage-metadata.module';
import { FormCreateComponent } from '../form-create/form-create.component';
import { AddNewValueComponent } from './add-new-value.component';

describe('AddNewValueComponent', () => {
	let category: string = 'test';
	let createdTag: TagVOData = null;
	let error: boolean = false;
	let messageShown: boolean = false;

	beforeEach(async () => {
		category = 'test';
		createdTag = null;
		error = false;
		messageShown = false;
		await MockBuilder(AddNewValueComponent, ManageMetadataModule)
			.keep(FormsModule)
			.keep(FormCreateComponent)
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

	function defaultRender(categoryName: string = category) {
		return MockRender(
			'<pr-metadata-add-new-value [category]="category"></pr-metadata-add-new-value>',
			{ category: categoryName },
		);
	}

	it('should create', () => {
		const fixture = defaultRender();

		expect(fixture.point.nativeElement).not.toBeNull();
	});

	it('should be able to create a new tag', async () => {
		defaultRender();
		const instance = ngMocks.findInstance(AddNewValueComponent);
		const tagsUpdateSpy = spyOn(instance.tagsUpdate, 'emit');

		expect(tagsUpdateSpy).not.toHaveBeenCalled();
		await instance.createNewTag('abc');

		expect(createdTag?.name).toBe('test:abc');
		expect(tagsUpdateSpy).toHaveBeenCalled();
	});

	it('should show an error message when it errors out', async () => {
		defaultRender();
		const instance = ngMocks.findInstance(AddNewValueComponent);
		const tagsUpdateSpy = spyOn(instance.tagsUpdate, 'emit');

		error = true;
		await expectAsync(instance.createNewTag('abc')).toBeRejected();

		expect(createdTag).toBeNull();
		expect(messageShown).toBeTrue();
		expect(tagsUpdateSpy).not.toHaveBeenCalled();
	});
});
