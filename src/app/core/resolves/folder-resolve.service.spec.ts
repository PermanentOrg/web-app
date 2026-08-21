import { TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';
import { Router } from '@angular/router';

import { FolderResolveService } from '@core/resolves/folder-resolve.service';
import { AccountService } from '@shared/services/account/account.service';
import { FilesystemService } from '@root/app/filesystem/filesystem.service';
import { FolderResponse } from '@shared/services/api/folder.repo';
import { FolderVO } from '@models/index';
import {
	MessageDisplayOptions,
	MessageService,
} from '@shared/services/message/message.service';

const buildFolder = (folderData: Record<string, unknown>) =>
	new FolderVO({
		ChildItemVOs: [],
		type: 'type.folder.private',
		view: 'folder.view.grid',
		...folderData,
	});

describe('FolderResolveService', () => {
	let service: FolderResolveService;
	let accountService: AccountService;
	let filesystem: FilesystemService;
	let message: MessageService;
	let router: Router;

	beforeEach(() => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);
		config.providers.push(FolderResolveService);
		TestBed.configureTestingModule(config);

		service = TestBed.inject(FolderResolveService);
		accountService = TestBed.inject(AccountService);
		filesystem = TestBed.inject(FilesystemService);
		message = TestBed.inject(MessageService);
		router = TestBed.inject(Router);

		spyOn(accountService, 'getRootFolder').and.returnValue(
			new FolderVO({
				ChildItemVOs: [
					new FolderVO({
						folderId: '11',
						type: 'type.folder.root.private',
						archiveNbr: '0001-0001',
					}),
					new FolderVO({
						folderId: '22',
						type: 'type.folder.root.app',
						archiveNbr: '0001-0002',
					}),
					new FolderVO({
						folderId: '33',
						type: 'type.folder.root.public',
						archiveNbr: '0001-0003',
					}),
				],
			}),
		);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should load My Files by default', async () => {
		const getFolderSpy = spyOn(filesystem, 'getFolder').and.resolveTo(
			buildFolder({
				displayName: 'My Files',
				type: 'type.folder.root.private',
			}),
		);

		const result = await service.resolve(
			{ params: {}, data: {} } as any,
			{ url: '/private' } as any,
		);

		const requestedFolder = getFolderSpy.calls.mostRecent().args[0] as FolderVO;

		expect(getFolderSpy).toHaveBeenCalled();
		expect(requestedFolder.folderId).toBe('11');
		expect(result.displayName).toBe('My Files');
	});

	it('should load the apps folder on /apps', async () => {
		const getFolderSpy = spyOn(filesystem, 'getFolder').and.resolveTo(
			buildFolder({ displayName: 'Apps', type: 'type.folder.root.app' }),
		);

		await service.resolve(
			{ params: {}, data: {} } as any,
			{ url: '/apps' } as any,
		);

		expect((getFolderSpy.calls.mostRecent().args[0] as FolderVO).folderId).toBe(
			'22',
		);
	});

	it('should load the public root on /public', async () => {
		const getFolderSpy = spyOn(filesystem, 'getFolder').and.resolveTo(
			buildFolder({ displayName: 'Public', type: 'type.folder.root.public' }),
		);

		await service.resolve(
			{ params: {}, data: {} } as any,
			{ url: '/public' } as any,
		);

		expect((getFolderSpy.calls.mostRecent().args[0] as FolderVO).folderId).toBe(
			'33',
		);
	});

	it('should pass the route identifiers through for a deep link', async () => {
		const getFolderSpy = spyOn(filesystem, 'getFolder').and.resolveTo(
			buildFolder({ displayName: 'Deep Linked' }),
		);

		const result = await service.resolve(
			{
				params: { archiveNbr: '0001-0005', folderLinkId: '99' },
				data: {},
			} as any,
			{ url: '/private/0001-0005/99' } as any,
		);

		const requestedFolder = getFolderSpy.calls.mostRecent().args[0] as FolderVO;

		expect(requestedFolder.archiveNbr).toBe('0001-0005');
		expect(requestedFolder.folder_linkId).toBe('99' as any);
		expect(requestedFolder.folderId).toBeUndefined();
		expect(result.displayName).toBe('Deep Linked');
	});

	it('should splice share crumbs onto a shared record without loading a folder', async () => {
		const getFolderSpy = spyOn(filesystem, 'getFolder');
		const sharedRecord = { displayName: 'A shared photo' };

		const result = await service.resolve(
			{
				params: {},
				data: {},
				parent: {
					data: {
						sharePreviewVO: { FolderVO: null, RecordVO: sharedRecord },
						currentFolder: new FolderVO({
							pathAsText: ['My Files'],
							pathAsArchiveNbr: ['0001-0001'],
							pathAsFolder_linkId: [11],
						}),
					},
				},
			} as any,
			{ url: '/share/abc123' } as any,
		);

		expect(getFolderSpy).not.toHaveBeenCalled();
		expect(result.pathAsText).toEqual(['Shares', 'Record', 'My Files']);
		expect(result.pathAsArchiveNbr).toEqual([
			'0000-0000',
			'0000-0000',
			'0001-0001',
		]);

		expect(result.pathAsFolder_linkId).toEqual([0, 0, 11]);
		expect(result.ChildItemVOs).toEqual([sharedRecord] as any);
	});

	it('should redirect a timeline folder to the public timeline route', async () => {
		spyOn(filesystem, 'getFolder').and.resolveTo(
			buildFolder({ displayName: 'Trip', view: 'folder.view.timeline' }),
		);
		const navigateSpy = spyOn(router, 'navigate');

		await service.resolve(
			{
				params: {
					archiveNbr: '0001-0005',
					folderLinkId: '99',
					publicArchiveNbr: '0002-0000',
				},
				data: {},
			} as any,
			{ url: '/p/archive/0002-0000/0001-0005/99' } as any,
		);

		expect(navigateSpy).toHaveBeenCalledWith([
			'p',
			'archive',
			'0002-0000',
			'view',
			'timeline',
			'0001-0005',
			'99',
		]);
	});

	it('should not redirect when the route already declares a folder view', async () => {
		spyOn(filesystem, 'getFolder').and.resolveTo(
			buildFolder({ displayName: 'Trip', view: 'folder.view.timeline' }),
		);
		const navigateSpy = spyOn(router, 'navigate');

		const result = await service.resolve(
			{
				params: {
					archiveNbr: '0001-0005',
					folderLinkId: '99',
					publicArchiveNbr: '0002-0000',
				},
				data: { folderView: 'folder.view.timeline' },
			} as any,
			{ url: '/p/archive/0002-0000/view/timeline/0001-0005/99' } as any,
		);

		expect(navigateSpy).not.toHaveBeenCalled();
		expect(result.displayName).toBe('Trip');
	});

	it('should surface the server message when the load fails', async () => {
		spyOn(filesystem, 'getFolder').and.rejectWith(
			new FolderResponse({
				isSuccessful: false,
				Results: [{ message: ['Test Error'] }],
			}),
		);
		spyOn(accountService, 'logOut').and.resolveTo(null);
		spyOn(router, 'navigate');
		let displayedErrorMessage: string;
		spyOn(message, 'showError').and.callFake((data: MessageDisplayOptions) => {
			displayedErrorMessage = data.message;
		});

		await expectAsync(
			service.resolve(
				{ params: {}, data: {} } as any,
				{ url: '/private' } as any,
			),
		).toBeRejected();

		expect(displayedErrorMessage).toBe('Test Error');
	});

	it('should fall back to a generic message for a raw error', async () => {
		spyOn(filesystem, 'getFolder').and.rejectWith(new Error('Network down'));
		spyOn(accountService, 'logOut').and.resolveTo(null);
		spyOn(router, 'navigate');
		let displayedErrorMessage: string;
		spyOn(message, 'showError').and.callFake((data: MessageDisplayOptions) => {
			displayedErrorMessage = data.message;
		});

		await expectAsync(
			service.resolve(
				{ params: {}, data: {} } as any,
				{ url: '/private' } as any,
			),
		).toBeRejected();

		expect(displayedErrorMessage).toBe('error.generic.internal');
	});

	it('should log out when a root folder fails to load', async () => {
		spyOn(filesystem, 'getFolder').and.rejectWith(new Error('Network down'));
		const logOutSpy = spyOn(accountService, 'logOut').and.resolveTo(null);
		spyOn(router, 'navigate');
		spyOn(message, 'showError');

		await expectAsync(
			service.resolve(
				{ params: {}, data: {} } as any,
				{ url: '/private' } as any,
			),
		).toBeRejected();

		expect(logOutSpy).toHaveBeenCalled();
	});

	it('should redirect rather than throw when a deep link fails', async () => {
		spyOn(filesystem, 'getFolder').and.rejectWith(new Error('Network down'));
		const navigateSpy = spyOn(router, 'navigate');
		spyOn(message, 'showError');

		await expectAsync(
			service.resolve(
				{
					params: { archiveNbr: '0001-0005', folderLinkId: '99' },
					data: {},
				} as any,
				{ url: '/private/0001-0005/99' } as any,
			),
		).toBeRejectedWith(false);

		expect(navigateSpy).toHaveBeenCalledWith(['/private']);
	});
});
