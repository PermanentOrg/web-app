import { TestBed } from '@angular/core/testing';
import {
	Router,
	UrlTree,
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
} from '@angular/router';
import { AccountService } from '@shared/services/account/account.service';
import { AccountVO } from '@models/account-vo';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
	let guard: AuthGuard;
	let accountServiceSpy: jasmine.SpyObj<AccountService>;
	let routerSpy: jasmine.SpyObj<Router>;

	beforeEach(() => {
		accountServiceSpy = jasmine.createSpyObj('AccountService', [
			'getAccount',
			'hasOwnArchives',
		]);

		routerSpy = jasmine.createSpyObj('Router', ['createUrlTree', 'parseUrl']);

		TestBed.configureTestingModule({
			providers: [
				AuthGuard,
				{ provide: AccountService, useValue: accountServiceSpy },
				{ provide: Router, useValue: routerSpy },
			],
		});

		guard = TestBed.inject(AuthGuard);
	});

	function createMockRouteSnapshot(
		query: Record<string, string> = {},
	): ActivatedRouteSnapshot {
		return {
			queryParamMap: {
				get: (key: string) => query[key] ?? null,
			},
		} as any;
	}

	it('should allow access if no account is found', () => {
		accountServiceSpy.getAccount.and.returnValue(null);
		const result = guard.canActivate(createMockRouteSnapshot(), {
			url: '/signup',
		} as RouterStateSnapshot);

		expect(result).toBeTrue();
	});

	it('should redirect to /app/dialog:archives/pending if on /signup with invite params', () => {
		accountServiceSpy.getAccount.and.returnValue(
			new AccountVO({ accountId: 1 }),
		);

		const query = {
			inviteCode: 'xyz',
			fullName: 'Test User',
			primaryEmail: 'test@example.com',
		};

		const expectedTree = {} as UrlTree;
		routerSpy.createUrlTree.and.returnValue(expectedTree);

		const result = guard.canActivate(createMockRouteSnapshot(query), {
			url: '/signup',
		} as RouterStateSnapshot);

		expect(routerSpy.createUrlTree).toHaveBeenCalledWith([
			'/app',
			{ outlets: { primary: 'private', dialog: 'archives/pending' } },
		]);

		expect(result).toBe(expectedTree);
	});

	it('should redirect to /app/private if account has own archives', async () => {
		accountServiceSpy.getAccount.and.returnValue(
			new AccountVO({ accountId: 1 }),
		);
		accountServiceSpy.hasOwnArchives.and.returnValue(Promise.resolve(true));

		const expectedUrl = {} as UrlTree;
		routerSpy.parseUrl.and.returnValue(expectedUrl);

		const result = await guard.canActivate(createMockRouteSnapshot(), {
			url: '/app/anything',
		} as RouterStateSnapshot);

		expect(accountServiceSpy.hasOwnArchives).toHaveBeenCalled();
		expect(result).toBe(expectedUrl);
		expect(routerSpy.parseUrl).toHaveBeenCalledWith('/app/private');
	});

	it('should redirect to /app/onboarding if account has no own archives', async () => {
		accountServiceSpy.getAccount.and.returnValue(
			new AccountVO({ accountId: 1 }),
		);
		accountServiceSpy.hasOwnArchives.and.returnValue(Promise.resolve(false));

		const expectedUrl = {} as UrlTree;
		routerSpy.parseUrl.and.returnValue(expectedUrl);

		const result = await guard.canActivate(createMockRouteSnapshot(), {
			url: '/app/anything',
		} as RouterStateSnapshot);

		expect(accountServiceSpy.hasOwnArchives).toHaveBeenCalled();
		expect(result).toBe(expectedUrl);
		expect(routerSpy.parseUrl).toHaveBeenCalledWith('/app/onboarding');
	});
});
