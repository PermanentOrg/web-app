import { TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UploadService } from '@core/services/upload/upload.service';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { AuthResponse } from '@shared/services/api/index.repo';
import { AccountVO, FolderVO, RecordVO } from '@root/app/models';
import { HttpV2Service } from '@shared/services/http-v2/http-v2.service';
import { HttpService } from '@shared/services/http/http.service';
import { LocationStrategy } from '@angular/common';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { Subject } from 'rxjs';
import { StorageService } from '../../storage/storage.service';
import { EditService } from '../../../../core/services/edit/edit.service';
import { EventService } from '../../event/event.service';

const mockApiService = {
	account: {
		signUp: (
			email: string,
			fullName: string,
			password: string,
			passwordConfirm: string,
			agreed: boolean,
			optIn: boolean,
			createDefaultArchive: boolean,
			phone?: string,
			inviteCode?: string,
		) =>
			new Observable((observer) => {
				observer.next(
					new AccountVO({
						primaryEmail: 'test@permanent.org',
						fullName: 'Test User',
					}),
				);
				observer.complete();
			}),
		get: async (account: AccountVO) => await Promise.reject({}),
	},
	auth: {
		verify: (account, token, type) =>
			new Observable((observer) => {
				observer.next(
					new AuthResponse({
						isSuccessful: true,
						Results: [
							{
								data: [
									{
										AccountVO: {
											primaryEmail: 'test@permanent.org',
											fullName: 'Test User',
											emailStatus: 'status.auth.verified',
											phoneStatus: 'status.auth.verified',
										},
									},
								],
							},
						],
					}),
				);
				observer.complete();
			}),
		logIn: (
			email: string,
			password: string,
			rememberMe: boolean,
			keepLoggedIn: boolean,
		) =>
			new Observable((observer) => {
				observer.next(
					new AuthResponse({
						isSuccessful: true,
						Results: [
							{
								data: [
									{
										AccountVO: {
											primaryEmail: 'test@permanent.org',
											fullName: 'Test User',
										},
									},
								],
							},
						],
					}),
				);
				observer.complete();
			}),
	},
};

const mockRouter = {
	navigate: async (route: string[]) => await Promise.resolve(true),
};

const mockStorageService = {
	local: {
		get: () => {},
		set: () => {},
	},
	session: {
		get: () => {},
		set: () => {},
	},
};

const mockUploadService = {
	uploadFiles: async (parentFolder: FolderVO, files: File[]) =>
		await Promise.resolve(true),
};

const mockEditService = {
	deleteItems: async (items: any[]) => await Promise.resolve(true),
};

const mockCookieService = {
	set: (key: string, value: string) => {},
};

const mockDialogCdkService = {
	open: () => {},
};

const mockEventService = {
	dispatch: () => {},
};

const mockLocationStrategy = {
	path: () => '/app/private',
};

describe('AccountService', () => {
	let instance: AccountService;
	let uploadService: UploadService;
	let editService: EditService;
	let httpV2Service: HttpV2Service;
	let httpService: HttpService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			providers: [
				AccountService,
				{ provide: ApiService, useValue: mockApiService },
				{ provide: Router, useValue: mockRouter },
				{ provide: StorageService, useValue: mockStorageService },
				{ provide: UploadService, useValue: mockUploadService },
				{ provide: EditService, useValue: mockEditService },
				{ provide: CookieService, useValue: mockCookieService },
				{ provide: DialogCdkService, useValue: mockDialogCdkService },
				{ provide: EventService, useValue: mockEventService },
				{ provide: LocationStrategy, useValue: mockLocationStrategy },
				{
					provide: HttpV2Service,
					useValue: { tokenExpired: new Subject<void>() },
				},
				{
					provide: HttpService,
					useValue: { tokenExpired: new Subject<void>() },
				},
			],
		}).compileComponents();

		instance = TestBed.inject(AccountService);
		uploadService = TestBed.inject(UploadService);
		editService = TestBed.inject(EditService);
		httpV2Service = TestBed.inject(HttpV2Service);
		httpService = TestBed.inject(HttpService);
	});

	it('should be created', () => {
		expect(instance).toBeTruthy();
	});

	it('should make the correct API calls during signUp', async () => {
		const account = await instance.signUp(
			'test@permanent.org',
			'Test User',
			'password123',
			'password123',
			true,
			true,
			'',
			'',
			true,
		);

		expect(account.primaryEmail).toEqual('test@permanent.org');
	});

	it('should pass along errors encountered during signUp', async () => {
		const expectedError = 'Out of cheese error. Redo from start';
		try {
			await instance.signUp(
				'test@permanent.org',
				'Test User',
				'password123',
				'password123',
				true,
				true,
				'',
				'',
				true,
			);
		} catch (error) {
			expect(error).toEqual(expectedError);
		}
	});

	it('should update the account storage when a file is uploaded successfully', async () => {
		const account = new AccountVO({
			spaceLeft: 100000,
		});
		instance.setAccount(account);

		uploadService.uploadFiles(new FolderVO({}), [new File([], 'test.txt')]);
		instance.deductAccountStorage(200);

		expect(instance.getAccount().spaceLeft).toEqual(99800);
	});

	it('should add storage back after deleting an item', async () => {
		const account = new AccountVO({
			spaceLeft: 100000,
		});

		const itemsToDelete = [
			new RecordVO({ size: 100 }),
			new RecordVO({ size: 300 }),
		];

		const sizeOfItemsToDelete = itemsToDelete.reduce(
			(acc, item) => acc + item.size,
			0,
		);

		instance.setAccount(account);
		await editService.deleteItems(itemsToDelete);

		instance.deductAccountStorage(-sizeOfItemsToDelete);

		expect(instance.getAccount().spaceLeft).toEqual(100400);
	});

	describe('Log out on token expiration', () => {
		it('HttpV2Service', async () => {
			const logOut = spyOn(instance, 'logOut').and.rejectWith(false);
			httpV2Service.tokenExpired.next();

			expect(logOut).toHaveBeenCalled();
		});

		it('HttpService', async () => {
			const spy = spyOn(instance, 'logOut').and.rejectWith(false);
			httpService.tokenExpired.next();

			expect(spy).toHaveBeenCalled();
		});
	});
});
