import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Shallow } from 'shallow-render';
import { ApiService } from '@shared/services/api/api.service';
import { Observable } from 'rxjs';
import { TagVO, TagVOData } from '@models/tag-vo';
import { TagsService } from '@core/services/tags/tags.service';
import { find } from 'lodash';
import { MetadataValuePipe } from '../pipes/metadata-value.pipe';
import { ManageMetadataModule } from '../manage-metadata.module';
import { ManageCustomMetadataComponent } from './manage-custom-metadata.component';

describe('ManageCustomMetadataComponent #custom-metadata', () => {
	let shallow: Shallow<ManageCustomMetadataComponent>;
	let defaultTagList: TagVOData[] = [];

	beforeEach(async () => {
		defaultTagList = [
			{
				tagId: 1,
				name: 'basicTag',
				type: 'type.generic.placeholder',
			},
			{
				tagId: 2,
				name: 'a:1',
				type: 'type.tag.metadata.customField',
			},
			{
				tagId: 3,
				name: 'a:2',
				type: 'type.tag.metadata.customField',
			},
			{
				tagId: 4,
				name: 'a:3',
				type: 'type.tag.metadata.customField',
			},
			{
				tagId: 5,
				name: 'b:1',
				type: 'type.tag.metadata.customField',
			},
			{
				tagId: 6,
				name: 'c:1',
				type: 'type.tag.metadata.customField',
			},
		];

		shallow = new Shallow(ManageCustomMetadataComponent, ManageMetadataModule)
			.dontMock(MetadataValuePipe)
			.mock(TagsService, {
				getTags: () => [...defaultTagList],
				getTags$: () => new Observable<TagVOData[]>(),
				refreshTags: async () => {},
				resetTags: async () => {},
			})
			.mock(ApiService, {
				tag: {
					update: async (tag: TagVO) => {},
					delete: async (tag: TagVO) => {},
				},
			});
	});

	it('should create', async () => {
		const { element } = await shallow.render();

		expect(element).not.toBeNull();
	});

	it('should load custom metadata categories', async () => {
		const { find } = await shallow.render();

		expect(find('.category').length).toBe(3);
	});

	it('should be able to select a category', async () => {
		const { find, fixture } = await shallow.render();

		expect(find('.category.selected').length).toBe(0);
		find('.category')[0].triggerEventHandler('click', {});
		fixture.detectChanges();

		expect(find('.category.selected').length).toBe(1);
	});

	it('should be able to load tags by metadata category', async () => {
		const { find, fixture } = await shallow.render();

		expect(find('.value').length).toBe(0);
		find('.category')[0].triggerEventHandler('click', {});
		fixture.detectChanges();

		expect(find('.value').length).toBe(3);
	});

	it('should be able to react to the add-new-value form', async () => {
		const { find, fixture } = await shallow.render();
		find('.category')[0].triggerEventHandler('click', {});
		fixture.detectChanges();

		expect(find('.value').length).toBe(3);
		defaultTagList.push({
			tagId: 9,
			name: 'a:potato',
			type: 'type.tag.metadata.customField',
		});
		find('pr-metadata-add-new-value').triggerEventHandler('tagsUpdate', {});
		await fixture.whenStable();
		fixture.detectChanges();

		expect(find('.value').length).toBe(4);
	});

	it('should be able to filter out deleted tags', async () => {
		const { instance } = await shallow.render();
		instance.addDeletedTag(new TagVO(defaultTagList[1]));
		await instance.refreshTagsInPlace();

		expect(instance.tagsList.length).toBe(4);
		expect(instance.tagsList.map((t) => t.tagId)).not.toContain(2);
	});

	it('should be able to filter out deleted categories', async () => {
		const { instance } = await shallow.render();
		instance.addDeletedCategory('a');
		await instance.refreshTagsInPlace();

		expect(instance.tagsList.length).toBe(2);
		instance.tagsList.forEach((tag) => {
			expect(tag.name.startsWith('a:')).toBeFalse();
		});
	});

	it('should be able to un-filter out deleted categories that are recreated', async () => {
		const { instance } = await shallow.render();
		instance.addDeletedCategory('a');
		await instance.refreshTagsInPlace();
		defaultTagList.push({
			tagId: 9,
			name: 'a:potato',
			type: 'type.tag.metadata.customField',
		});
		await instance.refreshTagsInPlace();

		expect(instance.tagsList.length).toBe(3);
	});

	it('should unselect the current category if its been deleted', async () => {
		const { instance } = await shallow.render();
		instance.activeCategory = 'potato';
		instance.addDeletedCategory('potato');

		expect(instance.activeCategory).toBeNull();
	});

	it('should unselect the current category if its last tag is deleted', async () => {
		const { instance } = await shallow.render();
		instance.activeCategory = 'c';
		defaultTagList.pop();
		await instance.refreshTagsInPlace();

		expect(instance.activeCategory).toBeNull();
	});

	it('should unselect the current category if its last tag is hidden by a deletion action', async () => {
		const { instance } = await shallow.render();
		instance.activeCategory = 'c';
		instance.addDeletedTag(new TagVO(defaultTagList.slice(-1).pop()));

		expect(instance.activeCategory).toBeNull();
		instance.activeCategory = 'a';
		instance.addDeletedTag(new TagVO(defaultTagList[1]));

		expect(instance.activeCategory).toBe('a');
	});
});
