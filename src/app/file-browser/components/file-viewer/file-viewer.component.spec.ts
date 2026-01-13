import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { RecordVO, ItemVO, TagVOData, ArchiveVO } from '@root/app/models';
import { AccountService } from '@shared/services/account/account.service';
import { DataService } from '@shared/services/data/data.service';
import { EditService } from '@core/services/edit/edit.service';
import { TagsService } from '@core/services/tags/tags.service';
import { PublicProfileService } from '@public/services/public-profile/public-profile.service';
import { ShareLinksService } from '@root/app/share-links/services/share-links.service';
import { ApiService } from '@shared/services/api/api.service';
import { MockComponent } from 'ng-mocks';
import { TagsComponent } from '../../../shared/components/tags/tags.component';
import { FileViewerComponent } from './file-viewer.component';

@Pipe({ name: 'dsFileSize', standalone: false })
class MockFileSizePipe implements PipeTransform {
	transform(value: number): string {
		return value?.toString() || '';
	}
}

@Pipe({ name: 'getAltText', standalone: false })
class MockGetAltTextPipe implements PipeTransform {
	transform(value: any): string {
		return value?.displayName || '';
	}
}

@Pipe({ name: 'prConstants', standalone: false })
class MockPrConstantsPipe implements PipeTransform {
	transform(value: any): any {
		return value;
	}
}

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
	let component: FileViewerComponent;
	let fixture: ComponentFixture<FileViewerComponent>;
	let activatedRouteData: ActivatedRouteSnapshotData;
	let folderChildren: ItemVO[];
	let tagsService: MockTagsService;
	let navigatedUrl: string[];
	let savedProperty: { name: string; value: any };
	let hasAccess: boolean;
	let openedDialogs: string[];
	let downloaded: boolean;
	let publicProfileService: PublicProfileService;

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
		publicProfileService = new PublicProfileService();

		await TestBed.configureTestingModule({
			declarations: [
				FileViewerComponent,
				MockComponent(TagsComponent),
				MockFileSizePipe,
				MockGetAltTextPipe,
				MockPrConstantsPipe,
			],
			imports: [HttpClientTestingModule],
			providers: [
				{
					provide: Router,
					useValue: {
						navigate: async (route: string[]) => {
							navigatedUrl = route;
							return await Promise.resolve(true);
						},
						routerState: {
							snapshot: {
								url: 'exampleUrl.com',
							},
						},
					},
				},
				{
					provide: ActivatedRoute,
					useValue: {
						snapshot: {
							data: activatedRouteData,
						},
					},
				},
				{
					provide: DataService,
					useValue: {
						currentFolder: {
							ChildItemVOs: folderChildren,
						},
						fetchFullItems: async () => {},
						fetchLeanItems: async () => {},
						async downloadFile(_item: RecordVO, _type: string) {
							downloaded = true;
						},
					},
				},
				{
					provide: AccountService,
					useValue: {
						checkMinimumAccess: (_itemAccessRole: any, _minimumAccess: any) =>
							hasAccess,
					},
				},
				{
					provide: EditService,
					useValue: {
						async saveItemVoProperty(_record: any, name: string, value: any) {
							savedProperty = { name: name as string, value };
						},
						async openLocationDialog(_item: any) {
							openedDialogs.push('location');
						},
						async openTagsDialog(_record: any, _type: any) {
							openedDialogs.push('tags');
						},
					},
				},
				{ provide: TagsService, useValue: tagsService },
				{ provide: PublicProfileService, useValue: publicProfileService },
				{
					provide: ShareLinksService,
					useValue: {
						isUnlistedShare: async () => false,
						currentShareToken: null,
					},
				},
				{
					provide: ApiService,
					useValue: {
						record: {
							get: async () => ({ getRecordVO: () => defaultItem }),
						},
					},
				},
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(FileViewerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).not.toBeNull();
	});

	it('should have two tags components', () => {
		const tagsComponents = fixture.nativeElement.querySelectorAll('pr-tags');

		expect(tagsComponents.length).toBe(2);
	});

	it('should correctly distinguish between keywords and custom metadata', () => {
		expect(
			component.keywords.find((tag) => tag.name === 'tagOne'),
		).toBeTruthy();

		expect(
			component.keywords.find((tag) => tag.name === 'tagTwo'),
		).toBeTruthy();

		expect(
			component.keywords.find(
				(tag) => tag.name === 'customField:customValueOne',
			),
		).not.toBeTruthy();

		expect(
			component.keywords.find(
				(tag) => tag.name === 'customField:customValueTwo',
			),
		).not.toBeTruthy();

		expect(
			component.customMetadata.find((tag) => tag.name === 'tagOne'),
		).not.toBeTruthy();

		expect(
			component.customMetadata.find((tag) => tag.name === 'tagTwo'),
		).not.toBeTruthy();

		expect(
			component.customMetadata.find(
				(tag) => tag.name === 'customField:customValueOne',
			),
		).toBeTruthy();

		expect(
			component.customMetadata.find(
				(tag) => tag.name === 'customField:customValueTwo',
			),
		).toBeTruthy();
	});

	it('should be able to load multiple record in a folder', async () => {
		setUpMultipleRecords(defaultItem, secondItem);
		// Need to recreate the component with the new data
		fixture = TestBed.createComponent(FileViewerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		expect(component).not.toBeNull();
	});

	it('should listen to tag updates from the tag service', () => {
		tagsService.itemTagsObservable.next([
			{ type: 'type.tag.metadata.customField', name: 'test:metadta' },
			{ type: 'type.generic.placeholder', name: 'test' },
		]);

		expect(component.keywords.length).toBe(1);
		expect(component.customMetadata.length).toBe(1);
	});

	it('should listen to public profile archive updates', () => {
		publicProfileService.archiveBs.next(
			new ArchiveVO({ allowPublicDownload: true }),
		);

		expect(component.allowDownloads).toBeTruthy();
	});

	it('should handle null public profile archive updates', () => {
		publicProfileService.archiveBs.next(
			new ArchiveVO({ allowPublicDownload: true }),
		);
		publicProfileService.archiveBs.next(null);

		expect(component.allowDownloads).toBeFalsy();
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
			// Recreate component with new data
			fixture = TestBed.createComponent(FileViewerComponent);
			component = fixture.componentInstance;
			fixture.detectChanges();
			keyDown(component, 'ArrowRight');

			expect(component.currentIndex).toBe(1);
		});

		it('should handle left arrow key input', async () => {
			setUpMultipleRecords(secondItem, defaultItem);
			fixture = TestBed.createComponent(FileViewerComponent);
			component = fixture.componentInstance;
			fixture.detectChanges();
			keyDown(component, 'ArrowLeft');

			expect(component.currentIndex).toBe(0);
		});

		it('does not wrap around on right arrow', async () => {
			setUpMultipleRecords(secondItem, defaultItem);
			fixture = TestBed.createComponent(FileViewerComponent);
			component = fixture.componentInstance;
			fixture.detectChanges();
			keyDown(component, 'ArrowRight');

			expect(component.currentIndex).toBe(1);
		});

		it('does not wrap around on left arrow', async () => {
			setUpMultipleRecords(defaultItem, secondItem);
			fixture = TestBed.createComponent(FileViewerComponent);
			component = fixture.componentInstance;
			fixture.detectChanges();
			keyDown(component, 'ArrowLeft');

			expect(component.currentIndex).toBe(0);
		});

		it('does not increment if the current record is still loading', async () => {
			setUpMultipleRecords(
				defaultItem,
				secondItem,
				new RecordVO({ folder_linkId: 2 }),
			);
			fixture = TestBed.createComponent(FileViewerComponent);
			component = fixture.componentInstance;
			fixture.detectChanges();
			keyDown(component, 'ArrowRight');
			keyDown(component, 'ArrowRight');

			expect(component.currentIndex).toBe(1);
		});

		describe('Navigation after keyboard input', () => {
			it('should navigate if the record is already fully loaded with an archiveNbr', async () => {
				const secondItemWithArchiveNbr = Object.assign({}, secondItem, {
					archiveNbr: '1234-1234',
				});
				setUpMultipleRecords(defaultItem, secondItemWithArchiveNbr);
				fixture = TestBed.createComponent(FileViewerComponent);
				component = fixture.componentInstance;
				fixture.detectChanges();
				keyDown(component, 'ArrowRight');
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
				fixture = TestBed.createComponent(FileViewerComponent);
				component = fixture.componentInstance;
				fixture.detectChanges();
				keyDown(component, 'ArrowRight');
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
			// Access the internal URL from SafeResourceUrl
			const internalUrl = (url as any).changingThisBreaksApplicationSecurity;

			expect(internalUrl).toContain(phrase);
		}
		it('can get the URL of a document', async () => {
			setUpCurrentRecord('doc');
			fixture = TestBed.createComponent(FileViewerComponent);
			component = fixture.componentInstance;
			fixture.detectChanges();
			await fixture.whenStable();
			expectSantizedUrlToContain(component, 'used');
		});

		it('will prefer the URL of the original if it is a PDF', async () => {
			setUpCurrentRecord('pdf');
			fixture = TestBed.createComponent(FileViewerComponent);
			component = fixture.componentInstance;
			fixture.detectChanges();
			await fixture.whenStable();
			expectSantizedUrlToContain(component, 'original');
		});

		it('will prefer the URL of the original if it is a TXT file', async () => {
			setUpCurrentRecord('txt');
			fixture = TestBed.createComponent(FileViewerComponent);
			component = fixture.componentInstance;
			fixture.detectChanges();
			await fixture.whenStable();
			expectSantizedUrlToContain(component, 'original');
		});

		it('will have a falsy document URL if it is not a document', async () => {
			expect(component.getDocumentUrl()).toBeFalsy();
		});

		it('will have a falsy document URL if the URL is falsy', async () => {
			setUpCurrentRecord('pdf', false);
			fixture = TestBed.createComponent(FileViewerComponent);
			component = fixture.componentInstance;
			fixture.detectChanges();
			await fixture.whenStable();

			expect(component.getDocumentUrl()).toBeFalsy();
		});
	});

	describe('Component API', () => {
		function setAccess(access: boolean) {
			hasAccess = access;
			activatedRouteData.isPublicArchive = false;
		}
		it('can close the file viewer', () => {
			component.close();

			expect(navigatedUrl).toContain('.');
		});

		it('can finish editing', async () => {
			await component.onFinishEditing('displayName', 'Test');

			expect(savedProperty.name).toBe('displayName');
			expect(savedProperty.value).toBe('Test');
		});

		it('can open the location dialog with edit permissions', async () => {
			setAccess(true);
			fixture = TestBed.createComponent(FileViewerComponent);
			component = fixture.componentInstance;
			fixture.detectChanges();
			component.canEdit = true;
			component.onLocationClick();
			await fixture.whenStable();

			expect(openedDialogs).toContain('location');
		});

		it('cannot open the location dialog without edit permissions', async () => {
			setAccess(false);
			fixture = TestBed.createComponent(FileViewerComponent);
			component = fixture.componentInstance;
			fixture.detectChanges();
			component.onLocationClick();
			await fixture.whenStable();

			expect(openedDialogs).not.toContain('location');
		});

		it('can open the tags dialog with edit permissions', async () => {
			setAccess(true);
			fixture = TestBed.createComponent(FileViewerComponent);
			component = fixture.componentInstance;
			fixture.detectChanges();
			component.canEdit = true;
			component.onTagsClick('keyword');
			await fixture.whenStable();

			expect(openedDialogs).toContain('tags');
		});

		it('cannot open the tags dialog with edit permissions', async () => {
			setAccess(false);
			fixture = TestBed.createComponent(FileViewerComponent);
			component = fixture.componentInstance;
			fixture.detectChanges();
			component.onTagsClick('keyword');
			await fixture.whenStable();

			expect(openedDialogs).not.toContain('tags');
		});

		it('can download items', async () => {
			component.onDownloadClick();
			await fixture.whenStable();

			expect(downloaded).toBeTrue();
		});

		it('should display "Click to add location" on fullscreen view', () => {
			component.canEdit = true;
			fixture.detectChanges();
			const locationSpan = fixture.nativeElement.querySelector('.add-location');

			expect(locationSpan.textContent.trim()).toBe('Click to add location');
		});
	});
});
