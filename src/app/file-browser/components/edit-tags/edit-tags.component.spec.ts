import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { ItemVO, TagVOData, RecordVO } from '@models';
import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { TagsService } from '@core/services/tags/tags.service';
import { MessageService } from '@shared/services/message/message.service';
import { SearchService } from '@search/services/search.service';
import { TagResponse } from '@shared/services/api/tag.repo';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
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
	let component: EditTagsComponent;
	let fixture: ComponentFixture<EditTagsComponent>;
	let dialogCdkServiceSpy: jasmine.SpyObj<DialogCdkService>;

	beforeEach(async () => {
		dialogCdkServiceSpy = jasmine.createSpyObj('DialogCdkService', ['open']);

		await TestBed.configureTestingModule({
			declarations: [EditTagsComponent],
			imports: [NoopAnimationsModule, FormsModule],
			providers: [
				{
					provide: SearchService,
					useValue: { getTagResults: (tag: string) => defaultTagList },
				},
				{
					provide: TagsService,
					useValue: {
						getTags: () => defaultTagList,
						getTags$: () => of(defaultTagList),
						setItemTags: () => {},
						getItemTags$: () => of([]),
					},
				},
				{
					provide: MessageService,
					useValue: { showError: () => {} },
				},
				{
					provide: ApiService,
					useValue: {
						tag: {
							deleteTagLink: async (tag: TagVOData, tagLink: any) =>
								await Promise.resolve(new TagResponse()),
							create: async (tag: TagVOData, tagLink: any) =>
								await Promise.resolve(new TagResponse()),
						},
					},
				},
				{
					provide: DataService,
					useValue: {
						fetchFullItems: async (items: ItemVO[]) =>
							await Promise.resolve([]),
					},
				},
				{
					provide: DialogCdkService,
					useValue: dialogCdkServiceSpy,
				},
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(EditTagsComponent);
		component = fixture.componentInstance;
	});

	function setupComponent(
		item: ItemVO = defaultItem,
		tagType: TagType = 'keyword',
	) {
		component.item = item;
		component.tagType = tagType;
		fixture.detectChanges();
	}

	it('should create', () => {
		setupComponent();

		expect(component).not.toBeNull();
	});

	it('should only show keywords in keyword mode', () => {
		setupComponent();

		expect(
			component.itemTags.find((tag) => tag.name === 'tagOne'),
		).toBeTruthy();

		expect(
			component.itemTags.find((tag) => tag.name === 'tagTwo'),
		).toBeTruthy();

		expect(
			component.itemTags.find(
				(tag) => tag.name === 'customField:customValueOne',
			),
		).not.toBeTruthy();

		expect(
			component.itemTags.find(
				(tag) => tag.name === 'customField:customValueTwo',
			),
		).not.toBeTruthy();

		expect(
			component.matchingTags.find((tag) => tag.name === 'tagOne'),
		).toBeTruthy();

		expect(
			component.matchingTags.find((tag) => tag.name === 'tagTwo'),
		).toBeTruthy();

		expect(
			component.matchingTags.find(
				(tag) => tag.name === 'customField:customValueOne',
			),
		).not.toBeTruthy();

		expect(
			component.matchingTags.find(
				(tag) => tag.name === 'customField:customValueTwo',
			),
		).not.toBeTruthy();
	});

	it('should only show custom metadata in custom metadata mode', () => {
		setupComponent(defaultItem, 'customMetadata');

		expect(
			component.itemTags.find((tag) => tag.name === 'tagOne'),
		).not.toBeTruthy();

		expect(
			component.itemTags.find((tag) => tag.name === 'tagTwo'),
		).not.toBeTruthy();

		expect(
			component.itemTags.find(
				(tag) => tag.name === 'customField:customValueOne',
			),
		).toBeTruthy();

		expect(
			component.itemTags.find(
				(tag) => tag.name === 'customField:customValueTwo',
			),
		).toBeTruthy();

		expect(
			component.matchingTags.find((tag) => tag.name === 'tagOne'),
		).not.toBeTruthy();

		expect(
			component.matchingTags.find((tag) => tag.name === 'tagTwo'),
		).not.toBeTruthy();

		expect(
			component.matchingTags.find(
				(tag) => tag.name === 'customField:customValueOne',
			),
		).toBeTruthy();

		expect(
			component.matchingTags.find(
				(tag) => tag.name === 'customField:customValueTwo',
			),
		).toBeTruthy();
	});

	it('should not create custom metadata in keyword mode', async () => {
		setupComponent();
		const apiService = TestBed.inject(ApiService);
		const tagCreateSpy = spyOn(apiService.tag, 'create');
		await component.onInputEnter('key:value');

		expect(component.newTagInputError).toBeTruthy();
		expect(tagCreateSpy).not.toHaveBeenCalled();
	});

	it('should not create keyword in custom metadata mode', async () => {
		setupComponent(defaultItem, 'customMetadata');
		const apiService = TestBed.inject(ApiService);
		const tagCreateSpy = spyOn(apiService.tag, 'create');
		await component.onInputEnter('keyword');

		expect(component.newTagInputError).toBeTruthy();
		expect(tagCreateSpy).not.toHaveBeenCalled();
	});

	it('should highlight the correct tag on key down', () => {
		setupComponent();

		component.isEditing = true;

		fixture.detectChanges();
		const tags = fixture.debugElement.queryAll(By.css('.edit-tag'));

		const arrowKeyDown = new KeyboardEvent('keydown', { key: 'ArrowDown' });
		tags[0].nativeElement.dispatchEvent(arrowKeyDown);

		fixture.detectChanges();

		const focusedElement = document.activeElement as HTMLElement;

		expect(focusedElement).toBe(tags[1].nativeElement);
	});

	it('should highlight the correct tag on key up', () => {
		setupComponent();

		component.isEditing = true;

		fixture.detectChanges();
		const tags = fixture.debugElement.queryAll(By.css('.edit-tag'));

		const arrowKeyDown = new KeyboardEvent('keydown', { key: 'ArrowUp' });
		tags[1].nativeElement.dispatchEvent(arrowKeyDown);

		fixture.detectChanges();

		const focusedElement = document.activeElement as HTMLElement;

		expect(focusedElement).toBe(tags[0].nativeElement);
	});

	it('should highlight the input on key up', () => {
		setupComponent();

		component.isEditing = true;

		fixture.detectChanges();
		const tag = fixture.debugElement.query(By.css('.edit-tag'));

		const arrowKeyUp = new KeyboardEvent('keydown', { key: 'ArrowUp' });
		const input = fixture.debugElement.query(By.css('.new-tag'));

		tag.nativeElement.dispatchEvent(arrowKeyUp);

		fixture.detectChanges();

		const focusedElement = document.activeElement as HTMLElement;

		expect(focusedElement).toEqual(input.nativeElement);
	});

	it('should open dialog when manage link is clicked', () => {
		setupComponent();

		component.isEditing = true;
		fixture.detectChanges();

		const manageTagsLink = fixture.debugElement.query(
			By.css('.manage-tags-message .manage-tags-link'),
		);
		manageTagsLink.triggerEventHandler('click', {});

		expect(dialogCdkServiceSpy.open).toHaveBeenCalled();
	});
});
