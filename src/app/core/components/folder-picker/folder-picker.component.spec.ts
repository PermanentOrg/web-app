import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep, some } from 'lodash';

import { DataService } from '@shared/services/data/data.service';
import { ApiService } from '@shared/services/api/api.service';
import { FolderResponse } from '@shared/services/api/index.repo';
import { SharedModule } from '@shared/shared.module';
import { By } from '@angular/platform-browser';
import { BgImageSrcDirective } from '@shared/directives/bg-image-src.directive';
import { ArchiveVO, FolderType, FolderVO, RecordVO } from '@root/app/models';
import { AccountService } from '@shared/services/account/account.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { HttpTestingController } from '@angular/common/http/testing';
import { FolderPickerService } from '@core/services/folder-picker/folder-picker.service';
import { DataStatus } from '@models/data-status.enum';
import { MessageService } from '@shared/services/message/message.service';
import { RootFolderService } from '@shared/services/root-folder/root-folder.service';
import {
	FolderPickerComponent,
	FolderPickerOperations,
} from './folder-picker.component';

describe('FolderPickerComponent', () => {
	let component: FolderPickerComponent;
	let fixture: ComponentFixture<FolderPickerComponent>;

	beforeEach(async () => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);

		config.imports.push(SharedModule);

		config.declarations.push(FolderPickerComponent);

		config.providers.push(DataService);
		config.providers.push(ApiService);
		config.providers.push(FolderPickerService);

		TestBed.configureTestingModule(config).compileComponents();

		fixture = TestBed.createComponent(FolderPickerComponent);

		TestBed.inject(HttpTestingController);

		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create with no folder and should be hidden', () => {
		expect(component).toBeTruthy();
		expect(component.visible).toBeFalsy();
		expect(component.currentFolder).toBeFalsy();
	});

	it('should initialize a folder, strip out records, and load lean child folders', async () => {
		const api = TestBed.inject(ApiService) as ApiService;
		const folderExpected = require('@root/test/responses/folder.navigateMin.myFiles.success.json');
		const myFiles = new FolderResponse(folderExpected).getFolderVO();

		const getWithChildrenSpy = spyOn(
			api.folder,
			'getWithChildren',
		).and.resolveTo(new FolderResponse(folderExpected));

		await component.setFolder(myFiles);

		expect(getWithChildrenSpy).toHaveBeenCalledTimes(1);
		expect(component.currentFolder).toBeTruthy();
		expect(component.currentFolder.folder_linkId).toEqual(
			myFiles.folder_linkId,
		);

		expect(some(component.currentFolder.ChildItemVOs, 'isRecord')).toBeFalsy();

		const getLeanItemsExpected = require('@root/test/responses/folder.getLeanItems.folderPicker.myFiles.success.json');
		getWithChildrenSpy.and.resolveTo(new FolderResponse(getLeanItemsExpected));

		await component.loadCurrentFolderChildData();

		expect(component.currentFolder).toBeTruthy();
		expect(some(component.currentFolder.ChildItemVOs, 'isRecord')).toBeFalsy();
		expect(
			some(
				component.currentFolder.ChildItemVOs as FolderVO[],
				(childFolder: FolderVO) =>
					childFolder.dataStatus === DataStatus.Placeholder,
			),
		).toBeFalsy();
	});

	it('should read the thumbnail currently on the item', () => {
		const record = new RecordVO({ folder_linkId: 2, archiveNbr: 'a-2' });

		expect(component.getThumbnailUrl(record)).toBeUndefined();

		record.thumbnail256 = 'https://example.com/256';

		expect(component.getThumbnailUrl(record)).toBe('https://example.com/256');
	});

	it('should show a thumbnail that arrives after the row is rendered', () => {
		const record = new RecordVO({
			folder_linkId: 1,
			archiveNbr: 'a-1',
			displayName: 'photo.jpg',
		});
		const folder = new FolderVO({
			folder_linkId: 9,
			folderId: 9,
			displayName: 'Photos',
			type: 'type.folder.private.folder',
		});
		folder.ChildItemVOs = [record];

		component.allowRecords = true;
		component.currentFolder = folder;
		fixture.detectChanges();

		const backgrounds = fixture.debugElement.queryAll(
			By.directive(BgImageSrcDirective),
		);

		expect(backgrounds.length).toBe(1);

		const background = backgrounds[0].injector.get(BgImageSrcDirective);

		expect(background.bgSrc).toBeFalsy();

		// loadCurrentFolderChildData() writes the URL onto this same instance, so
		// the row has to notice a mutation that leaves the reference unchanged.
		record.thumbURL200 = 'https://example.com/thumb.jpg';
		fixture.detectChanges();

		expect(background.bgSrc).toBe('https://example.com/thumb.jpg');
	});

	['type.folder.root.root', 'root'].forEach((archiveRootType) => {
		it(`should load the archive root through the root folder loader (${archiveRootType})`, async () => {
			const api = TestBed.inject(ApiService) as ApiService;
			const currentArchive = new ArchiveVO({ archiveId: 2977 });
			spyOn(TestBed.inject(AccountService), 'getArchive').and.returnValue(
				currentArchive,
			);
			const loadRootFolderSpy = spyOn(
				TestBed.inject(RootFolderService),
				'loadRootFolder',
			).and.resolveTo(new FolderVO({ type: 'root', ChildItemVOs: [] }));
			const getWithChildrenSpy = spyOn(api.folder, 'getWithChildren');

			await component.setFolder(
				new FolderVO({ type: archiveRootType, folderId: 1 }),
			);

			expect(loadRootFolderSpy).toHaveBeenCalledOnceWith(currentArchive);
			expect(getWithChildrenSpy).not.toHaveBeenCalled();
			expect(component.isRootFolder).toBeTrue();
		});
	});

	[
		{
			rootSource: 'v1',
			archiveRoot: new FolderVO({
				type: 'type.folder.root.root',
				folderId: 1,
				ChildItemVOs: [
					new FolderVO({ folderId: 2, type: 'type.folder.root.private' }),
					new FolderVO({ folderId: 3, type: 'type.folder.root.app' }),
					new FolderVO({ folderId: 4, type: 'type.folder.root.vault' }),
				],
			}),
		},
		{
			rootSource: 'Stela',
			archiveRoot: new FolderVO({
				type: 'root',
				folderId: 1,
				ChildItemVOs: [
					new FolderVO({ folderId: 2, type: 'private-root' }),
					new FolderVO({ folderId: 3, type: 'app-root' }),
					new FolderVO({ folderId: 4, type: 'deprecated' }),
				],
			}),
		},
	].forEach(({ rootSource, archiveRoot }) => {
		it(`should strip apps and legacy folders out of a root loaded from ${rootSource}`, async () => {
			spyOn(TestBed.inject(RootFolderService), 'loadRootFolder').and.resolveTo(
				archiveRoot,
			);

			await component.setFolder(
				new FolderVO({ type: 'type.folder.root.root', folderId: 1 }),
			);

			expect(
				(component.currentFolder.ChildItemVOs as FolderVO[]).map(
					(child) => child.folderId,
				),
			).toEqual([2]);

			expect(component.isRootFolder).toBeTrue();
		});
	});

	(
		[
			'type.folder.root.public',
			'public-root',
			'type.folder.public',
			'public',
		] as FolderType[]
	).forEach((publicFolderType) => {
		it(`should ask for confirmation before choosing a ${publicFolderType} folder`, () => {
			const confirmSpy = spyOn(
				TestBed.inject(PromptService),
				'confirm',
			).and.returnValue(new Promise(() => {}));
			component.operationName = 'Move';
			component.currentFolder = new FolderVO({ type: publicFolderType });

			component.chooseFolder();

			expect(confirmSpy).toHaveBeenCalled();
		});
	});

	it('should keep the requested folder_linkId when the response omits it', async () => {
		const api = TestBed.inject(ApiService) as ApiService;

		// A Stela-shaped response with no folder_linkId or archiveNbr, which is
		// what Copy and Move need for the destination.
		spyOn(api.folder, 'getWithChildren').and.resolveTo(
			new FolderResponse({
				isSuccessful: true,
				Results: [
					{
						data: [
							{
								FolderVO: {
									type: 'type.folder.private',
									folderId: '200',
									ChildItemVOs: [],
								},
							},
						],
					},
				],
			}),
		);

		await component.setFolder(
			new FolderVO({
				type: 'type.folder.private',
				folderId: '200',
				folder_linkId: 158329,
				archiveNbr: '0001-0002',
			}),
		);

		expect(component.currentFolder.folder_linkId).toBe(158329);
		expect(component.currentFolder.archiveNbr).toBe('0001-0002');
	});

	it('should not override a folder_linkId the response does provide', async () => {
		const api = TestBed.inject(ApiService) as ApiService;

		spyOn(api.folder, 'getWithChildren').and.resolveTo(
			new FolderResponse({
				isSuccessful: true,
				Results: [
					{
						data: [
							{
								FolderVO: {
									type: 'type.folder.private',
									folderId: '200',
									folder_linkId: 999,
									ChildItemVOs: [],
								},
							},
						],
					},
				],
			}),
		);

		await component.setFolder(
			new FolderVO({
				type: 'type.folder.private',
				folderId: '200',
				folder_linkId: 158329,
			}),
		);

		expect(component.currentFolder.folder_linkId).toBe(999);
	});

	it('should replay the folder it came from when going back', async () => {
		const api = TestBed.inject(ApiService) as ApiService;
		const rootExpected = require('@root/test/responses/folder.getRoot.success.json');
		const folderExpected = require('@root/test/responses/folder.navigateMin.myFiles.success.json');

		const loadRootFolderSpy = spyOn(
			TestBed.inject(RootFolderService),
			'loadRootFolder',
		).and.resolveTo(new FolderResponse(rootExpected).getFolderVO(true));
		spyOn(api.folder, 'getWithChildren').and.resolveTo(
			new FolderResponse(folderExpected),
		);

		// Start at the root, then navigate into My Files.
		await component.setFolder(
			new FolderVO({ type: 'type.folder.root.root', folderId: 140682 }),
		);
		await component.navigate(
			new FolderVO({ type: 'type.folder.root.private', folderId: '140683' }),
		);
		loadRootFolderSpy.calls.reset();

		await component.goToParentFolder();

		// One Back returns to the root, without the intermediate "Archive Root"
		// folder that Stela would have served from the parent ids.
		expect(loadRootFolderSpy).toHaveBeenCalledTimes(1);
		expect(component.isRootFolder).toBeTrue();
	});

	it('should load child data when going back, so thumbnails come back too', async () => {
		const api = TestBed.inject(ApiService) as ApiService;
		const dataService = TestBed.inject(DataService) as DataService;
		const folderExpected = require('@root/test/responses/folder.navigateMin.myFiles.success.json');

		spyOn(api.folder, 'getWithChildren').and.resolveTo(
			new FolderResponse(folderExpected),
		);
		const fetchLeanItems = spyOn(dataService, 'fetchLeanItems').and.resolveTo(
			0,
		);

		component.allowRecords = true;
		await component.setFolder(
			new FolderVO({ type: 'type.folder.private', folderId: '100' }),
		);
		await component.navigate(
			new FolderVO({ type: 'type.folder.private', folderId: '200' }),
		);
		fetchLeanItems.calls.reset();

		await component.goToParentFolder();

		expect(fetchLeanItems).toHaveBeenCalledTimes(1);
	});

	it('should go to the root when there is nothing left to go back to', async () => {
		const api = TestBed.inject(ApiService) as ApiService;
		const rootExpected = require('@root/test/responses/folder.getRoot.success.json');
		const folderExpected = require('@root/test/responses/folder.navigateMin.myFiles.success.json');

		const loadRootFolderSpy = spyOn(
			TestBed.inject(RootFolderService),
			'loadRootFolder',
		).and.resolveTo(new FolderResponse(rootExpected).getFolderVO(true));
		spyOn(api.folder, 'getWithChildren').and.resolveTo(
			new FolderResponse(folderExpected),
		);

		// The record choosers open directly on My Files, so Back is available
		// with no visited folder to return to.
		await component.setFolder(
			new FolderVO({ type: 'type.folder.root.private', folderId: '140683' }),
		);

		await component.goToParentFolder();

		expect(loadRootFolderSpy).toHaveBeenCalledTimes(1);
	});

	it('should forget its history when reopened', async () => {
		const api = TestBed.inject(ApiService) as ApiService;
		const rootExpected = require('@root/test/responses/folder.getRoot.success.json');
		const folderExpected = require('@root/test/responses/folder.navigateMin.myFiles.success.json');

		const loadRootFolderSpy = spyOn(
			TestBed.inject(RootFolderService),
			'loadRootFolder',
		).and.resolveTo(new FolderResponse(rootExpected).getFolderVO(true));
		spyOn(api.folder, 'getWithChildren').and.resolveTo(
			new FolderResponse(folderExpected),
		);

		await component.setFolder(
			new FolderVO({ type: 'type.folder.private', folderId: '100' }),
		);
		await component.navigate(
			new FolderVO({ type: 'type.folder.private', folderId: '200' }),
		);

		// Reopening must not inherit the previous session's trail.
		void component.show(
			new FolderVO({ type: 'type.folder.root.private', folderId: '140683' }),
			FolderPickerOperations.ChooseRecord,
		);
		await component.goToParentFolder();

		expect(loadRootFolderSpy).toHaveBeenCalled();
	});

	it('should filter out folders listed in filterFolderLinkIds', async () => {
		const api = TestBed.inject(ApiService) as ApiService;
		const folderExpected = cloneDeep(
			require('@root/test/responses/folder.navigateMin.myFiles.success.json'),
		);
		const myFiles = new FolderResponse(folderExpected).getFolderVO(true);
		const excludedFolder = (myFiles.ChildItemVOs as FolderVO[]).find(
			(item) => item.isFolder,
		);

		spyOn(api.folder, 'getWithChildren').and.resolveTo(
			new FolderResponse(folderExpected),
		);

		component.filterFolderLinkIds = [excludedFolder.folder_linkId];
		await component.setFolder(myFiles);

		expect(
			some(
				component.currentFolder.ChildItemVOs,
				(item) => item.folder_linkId === excludedFolder.folder_linkId,
			),
		).toBeFalse();
	});

	// The trail is built from loaded folders, so the tests below need each
	// response to echo back the folder that was asked for.
	const folderResponseFor = (folderId: string) =>
		new FolderResponse({
			isSuccessful: true,
			Results: [
				{
					data: [
						{
							FolderVO: {
								type: 'type.folder.private',
								folderId,
								ChildItemVOs: [],
							},
						},
					],
				},
			],
		});

	it('should not record history for a navigation that failed', async () => {
		const api = TestBed.inject(ApiService) as ApiService;
		const rootExpected = require('@root/test/responses/folder.getRoot.success.json');

		const loadRootFolderSpy = spyOn(
			TestBed.inject(RootFolderService),
			'loadRootFolder',
		).and.resolveTo(new FolderResponse(rootExpected).getFolderVO(true));
		const getWithChildrenSpy = spyOn(
			api.folder,
			'getWithChildren',
		).and.callFake(async (folderVOs: FolderVO[]) =>
			folderResponseFor(String(folderVOs[0].folderId)),
		);
		spyOn(TestBed.inject(MessageService), 'showError');
		spyOn(TestBed.inject(DataService), 'fetchLeanItems').and.resolveTo(0);

		await component.setFolder(
			new FolderVO({ type: 'type.folder.private', folderId: '100' }),
		);

		getWithChildrenSpy.and.rejectWith(new Error('network down'));
		await component.navigate(
			new FolderVO({ type: 'type.folder.private', folderId: '200' }),
		);

		getWithChildrenSpy.calls.reset();

		await component.goToParentFolder();

		// Back goes up from where we still are rather than replaying the folder
		// we never left.
		expect(getWithChildrenSpy).not.toHaveBeenCalled();
		expect(loadRootFolderSpy).toHaveBeenCalledTimes(1);
	});

	it('should keep its history when going back fails', async () => {
		const api = TestBed.inject(ApiService) as ApiService;

		const getWithChildrenSpy = spyOn(
			api.folder,
			'getWithChildren',
		).and.callFake(async (folderVOs: FolderVO[]) =>
			folderResponseFor(String(folderVOs[0].folderId)),
		);
		spyOn(TestBed.inject(MessageService), 'showError');
		spyOn(TestBed.inject(DataService), 'fetchLeanItems').and.resolveTo(0);

		await component.setFolder(
			new FolderVO({ type: 'type.folder.private', folderId: '100' }),
		);
		await component.navigate(
			new FolderVO({ type: 'type.folder.private', folderId: '200' }),
		);
		await component.navigate(
			new FolderVO({ type: 'type.folder.private', folderId: '300' }),
		);

		getWithChildrenSpy.and.rejectWith(new Error('network down'));
		await component.goToParentFolder();

		getWithChildrenSpy.and.callFake(async (folderVOs: FolderVO[]) =>
			folderResponseFor(String(folderVOs[0].folderId)),
		);
		getWithChildrenSpy.calls.reset();

		// A retry still has the same folder to go back to, and the one below it
		// is still there after that.
		await component.goToParentFolder();

		expect(component.currentFolder.folderId).toBe('200');

		await component.goToParentFolder();

		expect(component.currentFolder.folderId).toBe('100');
	});

	it('should not load child data when the folder fails to load', async () => {
		const api = TestBed.inject(ApiService) as ApiService;
		const dataService = TestBed.inject(DataService) as DataService;

		spyOn(api.folder, 'getWithChildren').and.rejectWith(
			new Error('network down'),
		);
		const fetchLeanItems = spyOn(dataService, 'fetchLeanItems').and.resolveTo(
			0,
		);
		spyOn(TestBed.inject(MessageService), 'showError');

		await expectAsync(
			component.navigate(
				new FolderVO({ type: 'type.folder.private', folderId: '200' }),
			),
		).toBeResolved();

		expect(fetchLeanItems).not.toHaveBeenCalled();
		expect(component.currentFolder).toBeFalsy();
	});

	it('should show an error and stop waiting when the folder fails to load', async () => {
		const api = TestBed.inject(ApiService) as ApiService;
		const message = TestBed.inject(MessageService) as MessageService;
		const showError = spyOn(message, 'showError');

		spyOn(api.folder, 'getWithChildren').and.rejectWith(
			new Error('network down'),
		);

		await expectAsync(
			component.setFolder(
				new FolderVO({ type: 'type.folder.private', folderId: 1 }),
			),
		).toBeResolved();

		expect(showError).toHaveBeenCalledOnceWith({
			message: 'error.generic.internal',
			translate: true,
		});

		expect(component.waiting).toBeFalse();
	});
});
