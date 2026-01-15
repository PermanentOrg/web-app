import { TestBed } from '@angular/core/testing';
import { AccountVO } from '@models/account-vo';
import { Observable, Subject } from 'rxjs';
import { AuthResponse } from '@shared/services/api/auth.repo';
import { ApiService } from '@shared/services/api/api.service';
import { StorageService } from '@shared/services/storage/storage.service';
import { Router } from '@angular/router';
import { ArchiveVO } from '@models/index';
import { AccountResponse } from '@shared/services/api/account.repo';
import { LocationStrategy } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { DialogCdkService } from '@root/app/dialog-cdk/dialog-cdk.service';
import { EventService } from '@shared/services/event/event.service';
import { HttpV2Service } from '@shared/services/http-v2/http-v2.service';
import { HttpService } from '@shared/services/http/http.service';
import { AccountService } from '../account.service';

class AccountRepoStub {
	public static failRequest: boolean = false;
	public async get(_account: AccountVO) {
		if (AccountRepoStub.failRequest) {
			throw 'test error';
		}
		return new AccountResponse({
			isSuccessful: true,
			Results: [
				{
					data: [
						{
							AccountVO: {
								primaryEmail: 'test@permanent.org',
								fullName: 'Test User',
								keepLoggedIn: true,
							},
							ArchiveVO: {
								archiveNbr: '0001-0000',
							},
						},
					],
				},
			],
		});
	}
}

class AuthRepoStub {
	public static loggedIn: boolean = true;

	public logOut() {
		return new Observable<AuthResponse>();
	}

	public async isLoggedIn() {
		return new AuthResponse({
			isSuccessful: true,
			Results: [
				{
					data: [
						{
							SimpleVO: {
								key: 'bool',
								value: AuthRepoStub.loggedIn,
								createdDT: null,
								updatedDT: null,
							},
						},
					],
				},
			],
		});
	}
}

const dummyStorageService = {
	local: {
		get: () => {},
		set: () => {},
		delete: () => {},
	},
	session: {
		get: () => {},
		set: () => {},
		delete: () => {},
	},
};

describe('AccountService: refreshAccount', () => {
	let instance: AccountService;
	let apiService: ApiService;
	let router: Router;
	let location: LocationStrategy;
	let storageService: StorageService;
	let accountRepo: AccountRepoStub;
	let authRepo: AuthRepoStub;

	beforeEach(async () => {
		AuthRepoStub.loggedIn = true;
		AccountRepoStub.failRequest = false;
		accountRepo = new AccountRepoStub();
		authRepo = new AuthRepoStub();

		await TestBed.configureTestingModule({
			providers: [
				AccountService,
				{
					provide: ApiService,
					useValue: { auth: authRepo, account: accountRepo },
				},
				{ provide: StorageService, useValue: dummyStorageService },
				{
					provide: Router,
					useValue: { navigate: jasmine.createSpy('router.navigate') },
				},
				{
					provide: LocationStrategy,
					useValue: { path: () => '/app/private' },
				},
				{ provide: CookieService, useValue: {} },
				{ provide: DialogCdkService, useValue: {} },
				{ provide: EventService, useValue: { dispatch: () => {} } },
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
		apiService = TestBed.inject(ApiService);
		router = TestBed.inject(Router);
		location = TestBed.inject(LocationStrategy);
		storageService = TestBed.inject(StorageService);
	});

	function setUpSpies(
		url: string = '/app/private',
		withStorage: boolean = false,
	) {
		const logOutSpy = spyOn(apiService.auth, 'logOut').and.callThrough();
		spyOn(location, 'path').and.returnValue(url);

		instance.setArchive(new ArchiveVO({}));
		instance.setAccount(new AccountVO({}));

		let localStorageSpy;
		if (withStorage) {
			localStorageSpy = spyOn(storageService.local, 'set').and.callThrough();
			spyOn(instance, 'getStorage').and.returnValue(
				new AccountVO({ keepLoggedIn: true }),
			);
		}

		return { logOutSpy, localStorageSpy };
	}

	it('should be able to check if the user is logged in', async () => {
		const { logOutSpy, localStorageSpy } = setUpSpies('/app/private', true);

		await instance.refreshAccount();

		expect(logOutSpy).not.toHaveBeenCalled();
		expect(router.navigate).not.toHaveBeenCalled();
		expect(localStorageSpy).toHaveBeenCalled();
	});

	it('should redirect the user to the login page if their session expires', async () => {
		const { logOutSpy } = setUpSpies('/app/private');

		AuthRepoStub.loggedIn = false;
		await instance.refreshAccount();

		expect(logOutSpy).toHaveBeenCalled();
		expect(router.navigate).toHaveBeenCalled();
	});

	it('should not redirect the user to login page if their session expires on a public archive', async () => {
		const { logOutSpy } = setUpSpies('///p/0001-0000/?ksljflkasjlf');

		AuthRepoStub.loggedIn = false;
		await instance.refreshAccount();

		expect(logOutSpy).toHaveBeenCalled();
		expect(router.navigate).not.toHaveBeenCalled();
	});

	it('should not redirect the user to login page if their session expires in the public gallery', async () => {
		const { logOutSpy } = setUpSpies('///gallery/////');

		AuthRepoStub.loggedIn = false;
		await instance.refreshAccount();

		expect(logOutSpy).toHaveBeenCalled();
		expect(router.navigate).not.toHaveBeenCalled();
	});

	it('should redirect the user if the account/get call fails', async () => {
		const { logOutSpy } = setUpSpies('/app/private');

		AccountRepoStub.failRequest = true;
		await instance.refreshAccount();

		expect(logOutSpy).toHaveBeenCalled();
		expect(router.navigate).toHaveBeenCalled();
	});

	it('should not redirect the user if the account/get call fails on the public archive', async () => {
		const { logOutSpy } = setUpSpies('/p/0001-0000/');

		AccountRepoStub.failRequest = true;
		await instance.refreshAccount();

		expect(logOutSpy).toHaveBeenCalled();
		expect(router.navigate).not.toHaveBeenCalled();
	});

	it('should not redirect the user if the account/get call fails on the public gallery', async () => {
		const { logOutSpy } = setUpSpies('/gallery/');

		AccountRepoStub.failRequest = true;
		await instance.refreshAccount();

		expect(logOutSpy).toHaveBeenCalled();
		expect(router.navigate).not.toHaveBeenCalled();
	});
});
