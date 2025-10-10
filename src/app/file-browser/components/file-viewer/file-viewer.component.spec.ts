import { Router, ActivatedRoute } from '@angular/router';
import { SecurityContext } from '@angular/core';
import { Shallow } from 'shallow-render';
import { Subject } from 'rxjs';

import { RecordVO, ItemVO, TagVOData, ArchiveVO } from '@root/app/models';
import { AccountService } from '@shared/services/account/account.service';
import { DataService } from '@shared/services/data/data.service';
import { EditService } from '@core/services/edit/edit.service';
import { TagsService } from '@core/services/tags/tags.service';
import { PublicProfileService } from '@public/services/public-profile/public-profile.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FileBrowserComponentsModule } from '../../file-browser-components.module';
import { TagsComponent } from '../../../shared/components/tags/tags.component';
import { FileViewerComponent } from './file-viewer.component';

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
const defaultItem: ItemVO = new RecordVO({
	displayName: 'Default Item',
	TagVOs: defaultTagList,
	type: 'document',
	folder_linkId: 0,
});
const secondItem: ItemVO = new RecordVO({
	displayName: 'Second Item',
	TagVOs: [],
	type: 'image',
	folder_linkId: 1,
});

interface ActivatedRouteSnapshotData {
	singleFile: boolean;
	isPublicArchive: boolean;
	currentRecord: RecordVO;
}

class MockTagsService {
	public itemTagsObservable = new Subject<TagVOData[]>();
	public getItemTags$() {
		return this.itemTagsObservable;
	}
}

describe('FileViewerComponent', () => {
	let shallow: Shallow<FileViewerComponent>;
	let activatedRouteData: ActivatedRouteSnapshotData;
	let folderChildren: ItemVO[];
	let tagsService: MockTagsService;
	let navigatedUrl: string[];
	let savedProperty: { name: string; value: any };
	let hasAccess: boolean;
	let openedDialogs: string[];
	let downloaded: boolean;
	async function defaultRender() {
		return await shallow.render(`<pr-file-viewer>`);
	}

	function setUpMultipleRecords(...items: ItemVO[]) {
		folderChildren.push(...items);
		activatedRouteData.singleFile = false;
	}

	beforeEach(async () => {
		navigatedUrl = [];
		activatedRouteData = {
			singleFile: true,
			isPublicArchive: true,
			currentRecord: defaultItem,
		};
		folderChildren = [];
		tagsService = new MockTagsService();
		savedProperty = undefined;
		hasAccess = true;
		openedDialogs = [];
		downloaded = false;
		shallow = new Shallow(FileViewerComponent, FileBrowserComponentsModule)
			.import(HttpClientTestingModule)
			.dontMock(TagsService)
			.dontMock(PublicProfileService)
			.mock(Router, {
				navigate: async (route: string[]) => {
					navigatedUrl = route;
					return await Promise.resolve(true);
				},
				routerState: {
					snapshot: {
						url: 'exampleUrl.com',
					},
				},
			})
			.mock(ActivatedRoute, {
				snapshot: {
					data: activatedRouteData,
				},
			})
			.mock(DataService, {
				currentFolder: {
					ChildItemVOs: folderChildren,
				},
				fetchFullItems: async () => {},
				fetchLeanItems: async () => {},
				async downloadFile(_item: RecordVO, _type: string) {
					downloaded = true;
				},
			})
			.mock(AccountService, {
				checkMinimumAccess: (_itemAccessRole, _minimumAccess) => hasAccess,
			})
			.mock(EditService, {
				async saveItemVoProperty(_record, name, value) {
					savedProperty = { name: name as string, value };
				},
				async openLocationDialog(_item) {
					openedDialogs.push('location');
				},
				async openTagsDialog(_record, _type) {
					openedDialogs.push('tags');
				},
			})
			.provide({ provide: TagsService, useValue: tagsService })
			.provide({
				provide: PublicProfileService,
				useValue: new PublicProfileService(),
			});
	});

	it('should create', async () => {
		const { element } = await defaultRender();

		expect(element).not.toBeNull();
	});

	it('should have two tags components', async () => {
		const { findComponent } = await defaultRender();

		expect(findComponent(TagsComponent)).toHaveFound(2);
	});

	it('should correctly distinguish between keywords and custom metadata', async () => {
		const { element } = await defaultRender();

		expect(
			element.componentInstance.keywords.find((tag) => tag.name === 'tagOne'),
		).toBeTruthy();

		expect(
			element.componentInstance.keywords.find((tag) => tag.name === 'tagTwo'),
		).toBeTruthy();

		expect(
			element.componentInstance.keywords.find(
				(tag) => tag.name === 'customField:customValueOne',
			),
		).not.toBeTruthy();

		expect(
			element.componentInstance.keywords.find(
				(tag) => tag.name === 'customField:customValueTwo',
			),
		).not.toBeTruthy();

		expect(
			element.componentInstance.customMetadata.find(
				(tag) => tag.name === 'tagOne',
			),
		).not.toBeTruthy();

		expect(
			element.componentInstance.customMetadata.find(
				(tag) => tag.name === 'tagTwo',
			),
		).not.toBeTruthy();

		expect(
			element.componentInstance.customMetadata.find(
				(tag) => tag.name === 'customField:customValueOne',
			),
		).toBeTruthy();

		expect(
			element.componentInstance.customMetadata.find(
				(tag) => tag.name === 'customField:customValueTwo',
			),
		).toBeTruthy();
	});

	it('should be able to load multiple record in a folder', async () => {
		setUpMultipleRecords(defaultItem, secondItem);
		const { element } = await defaultRender();

		expect(element).not.toBeNull();
	});

	it('should listen to tag updates from the tag service', async () => {
		const { instance } = await defaultRender();
		tagsService.itemTagsObservable.next([
			{ type: 'type.tag.metadata.customField', name: 'test:metadta' },
			{ type: 'type.generic.placeholder', name: 'test' },
		]);

		expect(instance.keywords.length).toBe(1);
		expect(instance.customMetadata.length).toBe(1);
	});

	it('should listen to public profile archive updates', async () => {
		const { inject, instance } = await defaultRender();
		const publicProfile = inject(PublicProfileService);
		publicProfile.archiveBs.next(new ArchiveVO({ allowPublicDownload: true }));

		expect(instance.allowDownloads).toBeTruthy();
	});

	it('should handle null public profile archive updates', async () => {
		const { inject, instance } = await defaultRender();
		const publicProfile = inject(PublicProfileService);
		publicProfile.archiveBs.next(new ArchiveVO({ allowPublicDownload: true }));
		publicProfile.archiveBs.next(null);

		expect(instance.allowDownloads).toBeFalsy();
	});

	describe('Keyboard Input', () => {
		function keyDown(
			instance: FileViewerComponent,
			key: 'ArrowRight' | 'ArrowLeft',
		) {
			instance.onKeyDown(new KeyboardEvent('keydown', { key }));
		}
		it('should handle right arrow key input', async () => {
			setUpMultipleRecords(defaultItem, secondItem);
			const { instance } = await defaultRender();
			keyDown(instance, 'ArrowRight');

			expect(instance.currentIndex).toBe(1);
		});

		it('should handle left arrow key input', async () => {
			setUpMultipleRecords(secondItem, defaultItem);
			const { instance } = await defaultRender();
			keyDown(instance, 'ArrowLeft');

			expect(instance.currentIndex).toBe(0);
		});

		it('does not wrap around on right arrow', async () => {
			setUpMultipleRecords(secondItem, defaultItem);
			const { instance } = await defaultRender();
			keyDown(instance, 'ArrowRight');

			expect(instance.currentIndex).toBe(1);
		});

		it('does not wrap around on left arrow', async () => {
			setUpMultipleRecords(defaultItem, secondItem);
			const { instance } = await defaultRender();
			keyDown(instance, 'ArrowLeft');

			expect(instance.currentIndex).toBe(0);
		});

		it('does not increment if the current record is still loading', async () => {
			setUpMultipleRecords(
				defaultItem,
				secondItem,
				new RecordVO({ folder_linkId: 2 }),
			);
			const { instance } = await defaultRender();
			keyDown(instance, 'ArrowRight');
			keyDown(instance, 'ArrowRight');

			expect(instance.currentIndex).toBe(1);
		});

		describe('Navigation after keyboard input', () => {
			it('should navigate if the record is already fully loaded with an archiveNbr', async () => {
				const secondItemWithArchiveNbr = Object.assign({}, secondItem, {
					archiveNbr: '1234-1234',
				});
				setUpMultipleRecords(defaultItem, secondItemWithArchiveNbr);
				const { fixture, instance } = await defaultRender();
				keyDown(instance, 'ArrowRight');
				await fixture.whenStable();

				expect(navigatedUrl).toContain('1234-1234');
			});

			it('should navigate after the record has been fetched if it is still fetching', async () => {
				const secondItemFetching = Object.assign({}, secondItem, {
					isFetching: true,
					fetched: new Promise<void>((resolve) => {
						resolve();
					}),
				});
				setUpMultipleRecords(defaultItem, secondItemFetching);
				const { fixture, instance } = await defaultRender();
				keyDown(instance, 'ArrowRight');
				secondItemFetching.archiveNbr = '1234-1234';
				await fixture.whenStable();

				expect(navigatedUrl).toContain('1234-1234');
			});
		});
	});

	describe('URLs of PDF files', () => {
		function setUpCurrentRecord(
			typeOfOriginal: string,
			fileURLOfOriginal: string | false = 'http://example.com/original',
		) {
			activatedRouteData.currentRecord = new RecordVO({
				type: 'document',
				displayName: 'Test Doc',
				TagVOs: [],
				FileVOs: [
					{
						format: 'file.format.original',
						type: typeOfOriginal,
						fileURL: fileURLOfOriginal,
					},
					{
						format: 'file.format.converted',
						type: 'odt',
						fileURL: 'http://example.com/ignored',
					},
					{
						format: 'file.format.converted',
						type: 'pdf',
						fileURL: 'http://example.com/used',
					},
				],
			});
		}
		function expectSantizedUrlToContain(
			instance: FileViewerComponent,
			phrase: string,
		) {
			const url = instance.getDocumentUrl();

			expect(url).toBeTruthy();
			expect(
				instance.sanitizer.sanitize(SecurityContext.RESOURCE_URL, url),
			).toContain(phrase);
		}
		it('can get the URL of a document', async () => {
			setUpCurrentRecord('doc');
			const { instance } = await defaultRender();
			expectSantizedUrlToContain(instance, 'used');
		});

		it('will prefer the URL of the original if it is a PDF', async () => {
			setUpCurrentRecord('pdf');
			const { instance } = await defaultRender();
			expectSantizedUrlToContain(instance, 'original');
		});

		it('will prefer the URL of the original if it is a TXT file', async () => {
			setUpCurrentRecord('txt');
			const { instance } = await defaultRender();
			expectSantizedUrlToContain(instance, 'original');
		});

		it('will have a falsy document URL if it is not a document', async () => {
			const { instance } = await defaultRender();

			expect(instance.getDocumentUrl()).toBeFalsy();
		});

		it('will have a falsy document URL if the URL is falsy', async () => {
			setUpCurrentRecord('pdf', false);
			const { instance } = await defaultRender();

			expect(instance.getDocumentUrl()).toBeFalsy();
		});
	});

	describe('Component API', () => {
		function setAccess(access: boolean) {
			hasAccess = access;
			activatedRouteData.isPublicArchive = false;
		}
		it('can close the file viewer', async () => {
			const { instance } = await defaultRender();
			instance.close();

			expect(navigatedUrl).toContain('.');
		});

		it('can finish editing', async () => {
			const { instance } = await defaultRender();
			await instance.onFinishEditing('displayName', 'Test');

			expect(savedProperty.name).toBe('displayName');
			expect(savedProperty.value).toBe('Test');
		});

		it('can open the location dialog with edit permissions', async () => {
			setAccess(true);
			const { fixture, instance } = await defaultRender();
			instance.canEdit = true;
			instance.onLocationClick();
			await fixture.whenStable();

			expect(openedDialogs).toContain('location');
		});

		it('cannot open the location dialog without edit permissions', async () => {
			setAccess(false);
			const { fixture, instance } = await defaultRender();
			instance.onLocationClick();
			await fixture.whenStable();

			expect(openedDialogs).not.toContain('location');
		});

		it('can open the tags dialog with edit permissions', async () => {
			setAccess(true);
			const { fixture, instance } = await defaultRender();
			instance.canEdit = true;
			instance.onTagsClick('keyword');
			await fixture.whenStable();

			expect(openedDialogs).toContain('tags');
		});

		it('cannot open the tags dialog with edit permissions', async () => {
			setAccess(false);
			const { fixture, instance } = await defaultRender();
			instance.onTagsClick('keyword');
			await fixture.whenStable();

			expect(openedDialogs).not.toContain('tags');
		});

		it('can download items', async () => {
			const { fixture, instance } = await defaultRender();
			instance.onDownloadClick();
			await fixture.whenStable();

			expect(downloaded).toBeTrue();
		});

		it('should display "Click to add location" on fullscreen view', async () => {
			const { fixture, instance, find } = await defaultRender();
			instance.canEdit = true;
			fixture.detectChanges();
			const locationSpan = find('.add-location');

			expect(locationSpan.nativeElement.textContent.trim()).toBe(
				'Click to add location',
			);
		});
	});
});
