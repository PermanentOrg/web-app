import { waitForAsync } from '@angular/core/testing';
import { Shallow } from 'shallow-render';
import { of } from 'rxjs';

import { ItemVO, TagVOData, RecordVO } from '@models';
import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { TagsService } from '@core/services/tags/tags.service';
import { MessageService } from '@shared/services/message/message.service';
import { SearchService } from '@search/services/search.service';
import { TagResponse } from '@shared/services/api/tag.repo';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { FileBrowserComponentsModule } from '../../file-browser-components.module';
import { EditTagsComponent, TagType } from './edit-tags.component';

const defaultTagList: TagVOData[] = [
	{
		tagId: 1,
		name: 'tagOne',
		type: 'type.generic.placeholder',
	},
	{
		tagId: 2,
		name: 'tagTwo',
		type: 'type.generic.placeholder',
	},
	{
		tagId: 3,
		name: 'customField:customValueOne',
		type: 'type.tag.metadata.customField',
	},
	{
		tagId: 4,
		name: 'customField:customValueTwo',
		type: 'type.tag.metadata.customField',
	},
];
const defaultItem: ItemVO = new RecordVO({ TagVOs: defaultTagList });

describe('EditTagsComponent', () => {
	let shallow: Shallow<EditTagsComponent>;
	async function defaultRender(
		item: ItemVO = defaultItem,
		tagType: TagType = 'keyword',
	) {
		return await shallow.render(
			`<pr-edit-tags [item]="item" [tagType]="tagType"></pr-edit-tags>`,
			{
				bind: {
					item,
					tagType,
				},
			},
		);
	}

	beforeEach(waitForAsync(() => {
		shallow = new Shallow(EditTagsComponent, FileBrowserComponentsModule)
			.dontMock(NoopAnimationsModule)
			.import(NoopAnimationsModule)
			.mock(SearchService, { getTagResults: (tag) => defaultTagList })
			.mock(TagsService, {
				getTags: () => defaultTagList,
				getTags$: () => of(defaultTagList),
				setItemTags: () => {},
			})
			.mock(MessageService, { showError: () => {} })
			.mock(ApiService, {
				tag: {
					deleteTagLink: async (tag, tagLink) =>
						await Promise.resolve(new TagResponse()),
					create: async (tag, tagLink) =>
						await Promise.resolve(new TagResponse()),
				},
			})
			.mock(DataService, {
				fetchFullItems: async (items) => await Promise.resolve([]),
			})
			.mock(
				DialogCdkService,
				jasmine.createSpyObj('DialogCdkService', ['open']),
			);
	}));

	it('should create', async () => {
		const { element } = await defaultRender();

		expect(element).not.toBeNull();
	});

	it('should only show keywords in keyword mode', async () => {
		const { element } = await defaultRender();

		expect(
			element.componentInstance.itemTags.find((tag) => tag.name === 'tagOne'),
		).toBeTruthy();

		expect(
			element.componentInstance.itemTags.find((tag) => tag.name === 'tagTwo'),
		).toBeTruthy();

		expect(
			element.componentInstance.itemTags.find(
				(tag) => tag.name === 'customField:customValueOne',
			),
		).not.toBeTruthy();

		expect(
			element.componentInstance.itemTags.find(
				(tag) => tag.name === 'customField:customValueTwo',
			),
		).not.toBeTruthy();

		expect(
			element.componentInstance.matchingTags.find(
				(tag) => tag.name === 'tagOne',
			),
		).toBeTruthy();

		expect(
			element.componentInstance.matchingTags.find(
				(tag) => tag.name === 'tagTwo',
			),
		).toBeTruthy();

		expect(
			element.componentInstance.matchingTags.find(
				(tag) => tag.name === 'customField:customValueOne',
			),
		).not.toBeTruthy();

		expect(
			element.componentInstance.matchingTags.find(
				(tag) => tag.name === 'customField:customValueTwo',
			),
		).not.toBeTruthy();
	});

	it('should only show custom metadata in custom metadata mode', async () => {
		const { element } = await defaultRender(defaultItem, 'customMetadata');

		expect(
			element.componentInstance.itemTags.find((tag) => tag.name === 'tagOne'),
		).not.toBeTruthy();

		expect(
			element.componentInstance.itemTags.find((tag) => tag.name === 'tagTwo'),
		).not.toBeTruthy();

		expect(
			element.componentInstance.itemTags.find(
				(tag) => tag.name === 'customField:customValueOne',
			),
		).toBeTruthy();

		expect(
			element.componentInstance.itemTags.find(
				(tag) => tag.name === 'customField:customValueTwo',
			),
		).toBeTruthy();

		expect(
			element.componentInstance.matchingTags.find(
				(tag) => tag.name === 'tagOne',
			),
		).not.toBeTruthy();

		expect(
			element.componentInstance.matchingTags.find(
				(tag) => tag.name === 'tagTwo',
			),
		).not.toBeTruthy();

		expect(
			element.componentInstance.matchingTags.find(
				(tag) => tag.name === 'customField:customValueOne',
			),
		).toBeTruthy();

		expect(
			element.componentInstance.matchingTags.find(
				(tag) => tag.name === 'customField:customValueTwo',
			),
		).toBeTruthy();
	});

	it('should not create custom metadata in keyword mode', async () => {
		const { element } = await defaultRender();
		const tagCreateSpy = spyOn(element.componentInstance.api.tag, 'create');
		await element.componentInstance.onInputEnter('key:value');

		expect(element.componentInstance.newTagInputError).toBeTruthy();
		expect(tagCreateSpy).not.toHaveBeenCalled();
	});

	it('should not create keyword in custom metadata mode', async () => {
		const { element } = await defaultRender(defaultItem, 'customMetadata');
		const tagCreateSpy = spyOn(element.componentInstance.api.tag, 'create');
		await element.componentInstance.onInputEnter('keyword');

		expect(element.componentInstance.newTagInputError).toBeTruthy();
		expect(tagCreateSpy).not.toHaveBeenCalled();
	});

	it('should highlight the correct tag on key down', async () => {
		const { fixture, element } = await defaultRender();

		element.componentInstance.isEditing = true;

		fixture.detectChanges();
		const tags = fixture.debugElement.queryAll(By.css('.edit-tag'));

		const arrowKeyDown = new KeyboardEvent('keydown', { key: 'ArrowDown' });
		tags[0].nativeElement.dispatchEvent(arrowKeyDown);

		fixture.detectChanges();

		const focusedElement = document.activeElement as HTMLElement;

		expect(focusedElement).toBe(tags[1].nativeElement);
	});

	it('should highlight the correct tag on key up', async () => {
		const { fixture, element } = await defaultRender();

		element.componentInstance.isEditing = true;

		fixture.detectChanges();
		const tags = fixture.debugElement.queryAll(By.css('.edit-tag'));

		const arrowKeyDown = new KeyboardEvent('keydown', { key: 'ArrowUp' });
		tags[1].nativeElement.dispatchEvent(arrowKeyDown);

		fixture.detectChanges();

		const focusedElement = document.activeElement as HTMLElement;

		expect(focusedElement).toBe(tags[0].nativeElement);
	});

	it('should highlight the input on key up', async () => {
		const { fixture, element } = await defaultRender();

		element.componentInstance.isEditing = true;

		fixture.detectChanges();
		const tag = fixture.debugElement.query(By.css('.edit-tag'));

		const arrowKeyUp = new KeyboardEvent('keydown', { key: 'ArrowUp' });
		const input = fixture.debugElement.query(By.css('.new-tag'));

		tag.nativeElement.dispatchEvent(arrowKeyUp);

		fixture.detectChanges();

		const focusedElement = document.activeElement as HTMLElement;

		expect(focusedElement).toEqual(input.nativeElement);
	});

	it('should open dialog when manage link is clicked', async () => {
		const { element, find, inject, fixture } = await defaultRender();
		const dialogOpenSpy = inject(DialogCdkService);

		element.componentInstance.isEditing = true;
		fixture.detectChanges();

		find('.manage-tags-message .manage-tags-link').triggerEventHandler(
			'click',
			{},
		);

		expect(dialogOpenSpy.open).toHaveBeenCalled();
	});
});
