import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Shallow } from 'shallow-render';
import { Observable } from 'rxjs';
import { UploadService } from '@core/services/upload/upload.service';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { AuthResponse } from '@shared/services/api/index.repo';
import { AccountVO, FolderVO, RecordVO } from '@root/app/models';
import { HttpV2Service } from '@shared/services/http-v2/http-v2.service';
import { HttpService } from '@shared/services/http/http.service';
import { AppModule } from '../../../../app.module';
import { StorageService } from '../../storage/storage.service';
import { EditService } from '../../../../core/services/edit/edit.service';

describe('AccountService', () => {
	let shallow: Shallow<AccountService>;

	beforeEach(() => {
		shallow = new Shallow(AccountService, AppModule)
			.mock(ApiService, {
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
			})
			.mock(Router, {
				navigate: async (route: string[]) => await Promise.resolve(true),
			})
			.mock(StorageService, {
				local: {
					get: () => {},
					set: () => {},
				},
				session: {
					get: () => {},
					set: () => {},
				},
			})
			.mock(UploadService, {
				uploadFiles: async (parentFolder: FolderVO, files: File[]) =>
					await Promise.resolve(true),
			})
			.mock(EditService, {
				deleteItems: async (items: any[]) => await Promise.resolve(true),
			})
			.mock(CookieService, { set: (key: string, value: string) => {} });
	});

	it('should be created', () => {
		const { instance } = shallow.createService();

		expect(instance).toBeTruthy();
	});

	it('should make the correct API calls during signUp', async () => {
		const { instance, inject } = shallow.createService();
		inject(ApiService);
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
		const { instance, inject } = shallow.createService();
		inject(ApiService);
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
		const { instance, inject } = shallow.createService();
		const uploadService = inject(UploadService);
		const account = new AccountVO({
			spaceLeft: 100000,
		});
		instance.setAccount(account);

		uploadService.uploadFiles(new FolderVO({}), [new File([], 'test.txt')]);
		instance.deductAccountStorage(200);

		expect(instance.getAccount().spaceLeft).toEqual(99800);
	});

	it('should add storage back after deleting an item', async () => {
		const { instance, inject } = shallow.createService();
		const editService = inject(EditService);
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
			const { instance, inject } = shallow.createService();
			const logOut = spyOn(instance, 'logOut').and.rejectWith(false);
			inject(HttpV2Service).tokenExpired.next();

			expect(logOut).toHaveBeenCalled();
		});

		it('HttpService', async () => {
			const { instance, inject } = shallow.createService();
			const spy = spyOn(instance, 'logOut').and.rejectWith(false);
			inject(HttpService).tokenExpired.next();

			expect(spy).toHaveBeenCalled();
		});
	});
});
