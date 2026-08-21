import { TestBed } from '@angular/core/testing';
import * as Testing from '@root/test/testbedConfig';
import { cloneDeep } from 'lodash';
import { Router } from '@angular/router';

import { LeanFolderResolveService } from '@core/resolves/lean-folder-resolve.service';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { FolderResponse } from '@shared/services/api/folder.repo';
import { FolderVO } from '@models/index';
import {
	MessageDisplayOptions,
	MessageService,
} from '@shared/services/message/message.service';

const buildFolderResponse = (folderData: Record<string, unknown>) =>
	new FolderResponse({
		isSuccessful: true,
		Results: [{ data: [{ FolderVO: { ChildItemVOs: [], ...folderData } }] }],
	});

describe('LeanFolderResolveService', () => {
	let service: LeanFolderResolveService;
	let api: ApiService;
	let accountService: AccountService;
	let message: MessageService;
	let router: Router;

	beforeEach(() => {
		const config = cloneDeep(Testing.BASE_TEST_CONFIG);
		config.providers.push(LeanFolderResolveService);
		TestBed.configureTestingModule(config);

		service = TestBed.inject(LeanFolderResolveService);
		api = TestBed.inject(ApiService);
		accountService = TestBed.inject(AccountService);
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
				],
			}),
		);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should load My Files by default', async () => {
		const getSpy = spyOn(
			api.folder,
			'getWithChildrenByIdentifier',
		).and.resolveTo(buildFolderResponse({ displayName: 'My Files' }));

		const result = await service.resolve(
			{ params: {} } as any,
			{ url: '/private' } as any,
		);

		expect(getSpy).toHaveBeenCalled();
		expect(getSpy.calls.mostRecent().args[0].folderId).toBe('11');
		expect(result.displayName).toBe('My Files');
	});

	it('should load the apps folder on /apps', async () => {
		const getSpy = spyOn(
			api.folder,
			'getWithChildrenByIdentifier',
		).and.resolveTo(buildFolderResponse({ displayName: 'Apps' }));

		await service.resolve({ params: {} } as any, { url: '/apps' } as any);

		expect(getSpy.calls.mostRecent().args[0].folderId).toBe('22');
	});

	it('should pass the route identifiers through for a deep link', async () => {
		const getSpy = spyOn(
			api.folder,
			'getWithChildrenByIdentifier',
		).and.resolveTo(buildFolderResponse({ displayName: 'Deep Linked' }));

		const result = await service.resolve(
			{ params: { archiveNbr: '0001-0005', folderLinkId: '99' } } as any,
			{ url: '/view/timeline/0001-0005/99' } as any,
		);

		const requestedFolder = getSpy.calls.mostRecent().args[0];

		expect(requestedFolder.archiveNbr).toBe('0001-0005');
		expect(requestedFolder.folder_linkId).toBe('99' as any);
		expect(requestedFolder.folderId).toBeUndefined();
		expect(result.displayName).toBe('Deep Linked');
	});

	it('should splice share crumbs onto a shared record without calling the API', async () => {
		const getSpy = spyOn(api.folder, 'getWithChildrenByIdentifier');
		const sharedRecord = { displayName: 'A shared photo' };

		const result = await service.resolve(
			{
				params: {},
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
			{ url: '/share/abc123/view/timeline' } as any,
		);

		expect(getSpy).not.toHaveBeenCalled();
		expect(result.pathAsText).toEqual(['Shares', 'Record', 'My Files']);
		expect(result.pathAsArchiveNbr).toEqual([
			'0000-0000',
			'0000-0000',
			'0001-0001',
		]);

		expect(result.pathAsFolder_linkId).toEqual([0, 0, 11]);
		expect(result.ChildItemVOs).toEqual([sharedRecord] as any);
	});

	it('should surface the server message when the load fails', async () => {
		spyOn(api.folder, 'getWithChildrenByIdentifier').and.rejectWith(
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
			service.resolve({ params: {} } as any, { url: '/private' } as any),
		).toBeRejected();

		expect(displayedErrorMessage).toBe('Test Error');
	});

	it('should log out when a root folder fails to load', async () => {
		spyOn(api.folder, 'getWithChildrenByIdentifier').and.rejectWith(
			new Error('Network down'),
		);
		const logOutSpy = spyOn(accountService, 'logOut').and.resolveTo(null);
		spyOn(router, 'navigate');
		spyOn(message, 'showError');

		await expectAsync(
			service.resolve({ params: {} } as any, { url: '/private' } as any),
		).toBeRejected();

		expect(logOutSpy).toHaveBeenCalled();
	});

	it('should fall back to a generic message for a raw error', async () => {
		spyOn(api.folder, 'getWithChildrenByIdentifier').and.rejectWith(
			new Error('Network down'),
		);
		spyOn(accountService, 'logOut').and.resolveTo(null);
		spyOn(router, 'navigate');
		let displayedErrorMessage: string;
		spyOn(message, 'showError').and.callFake((data: MessageDisplayOptions) => {
			displayedErrorMessage = data.message;
		});

		await expectAsync(
			service.resolve({ params: {} } as any, { url: '/private' } as any),
		).toBeRejected();

		expect(displayedErrorMessage).toBe('error.generic.internal');
	});

	it('should redirect rather than throw when a deep link fails', async () => {
		spyOn(api.folder, 'getWithChildrenByIdentifier').and.rejectWith(
			new Error('Network down'),
		);
		const navigateSpy = spyOn(router, 'navigate');
		spyOn(message, 'showError');

		await expectAsync(
			service.resolve(
				{ params: { archiveNbr: '0001-0005', folderLinkId: '99' } } as any,
				{ url: '/view/timeline/0001-0005/99' } as any,
			),
		).toBeRejectedWith(false);

		expect(navigateSpy).toHaveBeenCalledWith(['/private']);
	});
});
