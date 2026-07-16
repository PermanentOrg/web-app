import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ApiService } from '@shared/services/api/api.service';
import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { FolderResponse } from '@shared/services/api/index.repo';
import { FolderVO } from '@root/app/models';
import { LeanFolderResolveService } from './lean-folder-resolve.service';

const buildMockFolderResponse = (folderVO: Partial<FolderVO> = {}) =>
	new FolderResponse({
		isSuccessful: true,
		Results: [
			{
				data: [
					{
						FolderVO: new FolderVO({
							folderId: 'folder-1',
							type: 'type.folder.generic',
							ChildItemVOs: [],
							...folderVO,
						}),
					},
				],
				status: true,
				message: ['OK'],
				resultDT: new Date().toISOString(),
				createdDT: null,
				updatedDT: null,
			},
		],
	});

const buildRoute = (
	params: Record<string, string> = {},
	parentData: Record<string, unknown> = {},
): ActivatedRouteSnapshot =>
	({
		params,
		parent: { data: parentData },
	}) as any;

const buildState = (url: string): RouterStateSnapshot => ({ url }) as any;

describe('LeanFolderResolveService', () => {
	let service: LeanFolderResolveService;
	let getWithChildrenSpy: jasmine.Spy;
	let accountService: { getRootFolder: jasmine.Spy; logOut: jasmine.Spy };
	let messageService: { showError: jasmine.Spy };
	let router: { navigate: jasmine.Spy };

	const privateFolder = new FolderVO({
		folderId: 'private-root',
		folder_linkId: 1,
		archiveNbr: '0001-0001',
		type: 'type.folder.root.private',
	});

	const appsFolder = new FolderVO({
		folderId: 'apps-root',
		folder_linkId: 2,
		archiveNbr: '0002-0001',
		type: 'type.folder.root.app',
	});

	beforeEach(() => {
		getWithChildrenSpy = jasmine
			.createSpy('getWithChildren')
			.and.resolveTo(buildMockFolderResponse());

		accountService = {
			getRootFolder: jasmine.createSpy('getRootFolder').and.returnValue(
				new FolderVO({
					ChildItemVOs: [privateFolder, appsFolder],
				}),
			),
			logOut: jasmine.createSpy('logOut').and.resolveTo(undefined),
		};

		messageService = { showError: jasmine.createSpy('showError') };
		router = { navigate: jasmine.createSpy('navigate') };

		TestBed.configureTestingModule({
			providers: [
				LeanFolderResolveService,
				{
					provide: ApiService,
					useValue: { folder: { getWithChildren: getWithChildrenSpy } },
				},
				{ provide: AccountService, useValue: accountService },
				{ provide: MessageService, useValue: messageService },
				{ provide: Router, useValue: router },
			],
		});

		service = TestBed.inject(LeanFolderResolveService);
	});

	describe('route branches', () => {
		it('should call getWithChildren with a FolderVO built from URL params', async () => {
			const route = buildRoute({
				archiveNbr: '0001-0001',
				folderLinkId: '123',
			});
			const state = buildState('/private/0001-0001/123');

			await service.resolve(route, state);

			const calledWith = getWithChildrenSpy.calls.mostRecent()
				.args[0][0] as FolderVO;

			expect(calledWith.archiveNbr).toBe('0001-0001');
			expect(String(calledWith.folder_linkId)).toBe('123');
		});

		it('should call getWithChildren with the apps folder when url is /apps', async () => {
			const route = buildRoute({});
			const state = buildState('/apps');

			await service.resolve(route, state);

			const calledWith = getWithChildrenSpy.calls.mostRecent()
				.args[0][0] as FolderVO;

			expect(calledWith.type).toBe('type.folder.root.app');
		});

		it('should call getWithChildren with the shared folder when in a /share/ route with a folder', async () => {
			const sharedFolder = new FolderVO({
				folderId: 'shared-folder',
				type: 'type.folder.generic',
			});
			const route = buildRoute(
				{},
				{ sharePreviewVO: { FolderVO: sharedFolder, RecordVO: null } },
			);
			const state = buildState('/share/token123');

			await service.resolve(route, state);

			const calledWith = getWithChildrenSpy.calls.mostRecent()
				.args[0][0] as FolderVO;

			expect(calledWith.folderId).toBe('shared-folder');
		});

		it('should return the folder directly without an API call when in a /share/ route with a record', async () => {
			const currentFolder = new FolderVO({
				folderId: 'current',
				pathAsArchiveNbr: ['root'],
				pathAsText: ['My Files'],
				pathAsFolder_linkId: [0],
				ChildItemVOs: [],
			});
			const sharedRecord = { recordId: 999, isRecord: true };
			const route = buildRoute(
				{},
				{
					sharePreviewVO: { FolderVO: null, RecordVO: sharedRecord },
					currentFolder,
				},
			);
			const state = buildState('/share/token123');

			const result = await service.resolve(route, state);

			expect(getWithChildrenSpy).not.toHaveBeenCalled();
			expect(result.ChildItemVOs).toContain(sharedRecord as any);
		});

		it('should call getWithChildren with the private root folder for the default route', async () => {
			const route = buildRoute({});
			const state = buildState('/private');

			await service.resolve(route, state);

			const calledWith = getWithChildrenSpy.calls.mostRecent()
				.args[0][0] as FolderVO;

			expect(calledWith.type).toBe('type.folder.root.private');
		});

		it('should return the FolderVO from the response', async () => {
			getWithChildrenSpy.and.resolveTo(
				buildMockFolderResponse({ folderId: 'resolved' }),
			);

			const route = buildRoute({});
			const state = buildState('/private');

			const result = await service.resolve(route, state);

			expect(result.folderId).toBe('resolved');
		});
	});

	describe('error handling', () => {
		// getWithChildren never rejects: on failure it resolves with an
		// error-shaped FolderResponse (isSuccessful falsy, no data, message
		// from the API error). This mirrors that shape.
		const buildErrorFolderResponse = (errorMessage: string) => {
			const errorResponse = new FolderResponse();
			errorResponse.Results = [{ message: [errorMessage] }];
			return errorResponse;
		};

		it('should show an error message when getWithChildren returns an unsuccessful response', async () => {
			getWithChildrenSpy.and.resolveTo(
				buildErrorFolderResponse('Folder not found'),
			);

			const route = buildRoute({});
			const state = buildState('/private');

			await service.resolve(route, state).catch(() => {});

			expect(messageService.showError).toHaveBeenCalledWith({
				message: 'Folder not found',
				translate: true,
			});
		});

		it('should log out and navigate to /login when a root folder fails', async () => {
			// Default branch → privateFolder with type 'type.folder.root.private'
			// which includes 'root' → logOut is called
			getWithChildrenSpy.and.resolveTo(
				buildErrorFolderResponse('Folder not found'),
			);

			const route = buildRoute({});
			const state = buildState('/private');

			await service.resolve(route, state).catch(() => {});

			expect(accountService.logOut).toHaveBeenCalled();
		});

		it('should log out and navigate to /login when the apps root folder fails', async () => {
			// Apps branch → appsFolder with type 'type.folder.root.app'
			// which also includes 'root' → logOut is called, not navigate(['/apps'])
			getWithChildrenSpy.and.resolveTo(
				buildErrorFolderResponse('Folder not found'),
			);

			const route = buildRoute({});
			const state = buildState('/apps');

			await service.resolve(route, state).catch(() => {});

			expect(accountService.logOut).toHaveBeenCalled();
		});

		it('should navigate to /private when a non-root shared folder fails', async () => {
			// Share branch → sharedFolder with type 'type.folder.generic' (no 'root')
			// state.url does not include 'apps' → navigate(['/private'])
			getWithChildrenSpy.and.resolveTo(
				buildErrorFolderResponse('Folder not found'),
			);

			const sharedFolder = new FolderVO({
				folderId: 'shared-folder',
				type: 'type.folder.generic',
			});
			const route = buildRoute(
				{},
				{ sharePreviewVO: { FolderVO: sharedFolder, RecordVO: null } },
			);
			const state = buildState('/share/token123');

			await service.resolve(route, state).catch(() => {});

			expect(router.navigate).toHaveBeenCalledWith(['/private']);
		});

		it('should return a rejected promise when the API fails', async () => {
			getWithChildrenSpy.and.resolveTo(
				buildErrorFolderResponse('Folder not found'),
			);

			const route = buildRoute({});
			const state = buildState('/private');

			await expectAsync(service.resolve(route, state)).toBeRejected();
		});
	});
});
