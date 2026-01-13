import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { ApiService } from '@shared/services/api/api.service';
import { Observable } from 'rxjs';
import { TagVO, TagVOData } from '@models/tag-vo';
import { TagsService } from '@core/services/tags/tags.service';
import { MetadataValuePipe } from '../pipes/metadata-value.pipe';
import { ManageMetadataModule } from '../manage-metadata.module';
import { ManageCustomMetadataComponent } from './manage-custom-metadata.component';

describe('ManageCustomMetadataComponent #custom-metadata', () => {
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

		await MockBuilder(ManageCustomMetadataComponent, ManageMetadataModule)
			.keep(MetadataValuePipe)
			.provide({
				provide: TagsService,
				useValue: {
					getTags: () => [...defaultTagList],
					getTags$: () => new Observable<TagVOData[]>(),
					refreshTags: async () => {},
					resetTags: async () => {},
				},
			})
			.provide({
				provide: ApiService,
				useValue: {
					tag: {
						update: async (tag: TagVO) => {},
						delete: async (tag: TagVO) => {},
					},
				},
			});
	});

	it('should create', () => {
		const fixture = MockRender(ManageCustomMetadataComponent);

		expect(fixture.point.nativeElement).not.toBeNull();
	});

	it('should load custom metadata categories', () => {
		MockRender(ManageCustomMetadataComponent);

		expect(ngMocks.findAll('.category').length).toBe(3);
	});

	it('should be able to select a category', () => {
		const fixture = MockRender(ManageCustomMetadataComponent);

		expect(ngMocks.findAll('.category.selected').length).toBe(0);
		ngMocks.findAll('.category')[0].triggerEventHandler('click', {});
		fixture.detectChanges();

		expect(ngMocks.findAll('.category.selected').length).toBe(1);
	});

	it('should be able to load tags by metadata category', () => {
		const fixture = MockRender(ManageCustomMetadataComponent);

		expect(ngMocks.findAll('.value').length).toBe(0);
		ngMocks.findAll('.category')[0].triggerEventHandler('click', {});
		fixture.detectChanges();

		expect(ngMocks.findAll('.value').length).toBe(3);
	});

	it('should be able to react to the add-new-value form', async () => {
		const fixture = MockRender(ManageCustomMetadataComponent);

		ngMocks.findAll('.category')[0].triggerEventHandler('click', {});
		fixture.detectChanges();

		expect(ngMocks.findAll('.value').length).toBe(3);
		defaultTagList.push({
			tagId: 9,
			name: 'a:potato',
			type: 'type.tag.metadata.customField',
		});
		ngMocks
			.find('pr-metadata-add-new-value')
			.triggerEventHandler('tagsUpdate', {});
		await fixture.whenStable();
		fixture.detectChanges();

		expect(ngMocks.findAll('.value').length).toBe(4);
	});

	it('should be able to filter out deleted tags', async () => {
		const fixture = MockRender(ManageCustomMetadataComponent);
		const instance = fixture.point.componentInstance;

		instance.addDeletedTag(new TagVO(defaultTagList[1]));
		await instance.refreshTagsInPlace();

		expect(instance.tagsList.length).toBe(4);
		expect(instance.tagsList.map((t) => t.tagId)).not.toContain(2);
	});

	it('should be able to filter out deleted categories', async () => {
		const fixture = MockRender(ManageCustomMetadataComponent);
		const instance = fixture.point.componentInstance;

		instance.addDeletedCategory('a');
		await instance.refreshTagsInPlace();

		expect(instance.tagsList.length).toBe(2);
		instance.tagsList.forEach((tag) => {
			expect(tag.name.startsWith('a:')).toBeFalse();
		});
	});

	it('should be able to un-filter out deleted categories that are recreated', async () => {
		const fixture = MockRender(ManageCustomMetadataComponent);
		const instance = fixture.point.componentInstance;

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

	it('should unselect the current category if its been deleted', () => {
		const fixture = MockRender(ManageCustomMetadataComponent);
		const instance = fixture.point.componentInstance;

		instance.activeCategory = 'potato';
		instance.addDeletedCategory('potato');

		expect(instance.activeCategory).toBeNull();
	});

	it('should unselect the current category if its last tag is deleted', async () => {
		const fixture = MockRender(ManageCustomMetadataComponent);
		const instance = fixture.point.componentInstance;

		instance.activeCategory = 'c';
		defaultTagList.pop();
		await instance.refreshTagsInPlace();

		expect(instance.activeCategory).toBeNull();
	});

	it('should unselect the current category if its last tag is hidden by a deletion action', () => {
		const fixture = MockRender(ManageCustomMetadataComponent);
		const instance = fixture.point.componentInstance;

		instance.activeCategory = 'c';
		instance.addDeletedTag(new TagVO(defaultTagList.slice(-1).pop()));

		expect(instance.activeCategory).toBeNull();
		instance.activeCategory = 'a';
		instance.addDeletedTag(new TagVO(defaultTagList[1]));

		expect(instance.activeCategory).toBe('a');
	});
});
