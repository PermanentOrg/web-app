import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ShareLink } from '../models/share-link';
import { ShareLinksService } from './share-links.service';
import { ShareLinksApiService } from './share-links-api.service';

describe('ShareLinksService', () => {
	let service: ShareLinksService;
	let apiSpy: jasmine.SpyObj<ShareLinksApiService>;
	let routerEvents: Subject<NavigationEnd>;

	beforeEach(() => {
		apiSpy = jasmine.createSpyObj('ShareLinksApiService', [
			'getShareLinksByToken',
		]);
		routerEvents = new Subject<NavigationEnd>();

		TestBed.configureTestingModule({
			providers: [
				ShareLinksService,
				{ provide: ShareLinksApiService, useValue: apiSpy },
				{ provide: Router, useValue: { events: routerEvents.asObservable() } },
			],
		});

		service = TestBed.inject(ShareLinksService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should get and set currentShareToken', () => {
		service.currentShareToken = 'abc123';

		expect(service.currentShareToken).toBe('abc123');
	});

	it('should return false if no token is set', async () => {
		service.currentShareToken = '';
		const result = await service.isUnlistedShare();

		expect(result).toBeFalse();
		expect(apiSpy.getShareLinksByToken).not.toHaveBeenCalled();
	});

	it('should return false if no share links are returned', async () => {
		service.currentShareToken = 'abc123';
		apiSpy.getShareLinksByToken.and.resolveTo([]);
		const result = await service.isUnlistedShare();

		expect(result).toBeFalse();
	});

	it('should return true if accessRestrictions is "none"', async () => {
		service.currentShareToken = 'abc123';
		apiSpy.getShareLinksByToken.and.resolveTo([
			{ accessRestrictions: 'none' } as ShareLink,
		]);
		const result = await service.isUnlistedShare();

		expect(result).toBeTrue();
	});

	it('should return false if accessRestrictions is not "none"', async () => {
		service.currentShareToken = 'abc123';
		apiSpy.getShareLinksByToken.and.resolveTo([
			{ accessRestrictions: 'read-only' } as unknown as ShareLink,
		]);
		const result = await service.isUnlistedShare();

		expect(result).toBeFalse();
	});

	it('should cache shareLinks after first fetch', async () => {
		service.currentShareToken = 'abc123';
		apiSpy.getShareLinksByToken.and.resolveTo([
			{ accessRestrictions: 'none' } as ShareLink,
		]);

		const firstCall = await service.isUnlistedShare();

		expect(firstCall).toBeTrue();
		expect(apiSpy.getShareLinksByToken).toHaveBeenCalledTimes(1);

		const secondCall = await service.isUnlistedShare();

		expect(secondCall).toBeTrue();
		expect(apiSpy.getShareLinksByToken).toHaveBeenCalledTimes(1); // no second fetch
	});

	describe('primeForToken', () => {
		it('should set the current token and populate shareLinks cache', async () => {
			apiSpy.getShareLinksByToken.and.resolveTo([
				{ accessRestrictions: 'none' } as ShareLink,
			]);

			await service.primeForToken('abc123');

			expect(service.currentShareToken).toBe('abc123');
			expect(apiSpy.getShareLinksByToken).toHaveBeenCalledWith(['abc123']);
		});

		it('should swallow API errors and leave the cache empty', async () => {
			apiSpy.getShareLinksByToken.and.rejectWith(new Error('boom'));

			await service.primeForToken('abc123');

			expect(service.isUnlistedShareSync()).toBeFalse();
		});

		it('should skip the API call when the token is empty', async () => {
			await service.primeForToken('');

			expect(apiSpy.getShareLinksByToken).not.toHaveBeenCalled();
			expect(service.isUnlistedShareSync()).toBeFalse();
		});
	});

	describe('isUnlistedShareSync', () => {
		it('should return false before priming', () => {
			expect(service.isUnlistedShareSync()).toBeFalse();
		});

		it('should return true after priming an unlisted share', async () => {
			apiSpy.getShareLinksByToken.and.resolveTo([
				{ accessRestrictions: 'none' } as ShareLink,
			]);
			await service.primeForToken('abc123');

			expect(service.isUnlistedShareSync()).toBeTrue();
		});

		it('should return false after priming a restricted share', async () => {
			apiSpy.getShareLinksByToken.and.resolveTo([
				{ accessRestrictions: 'approval' } as ShareLink,
			]);
			await service.primeForToken('abc123');

			expect(service.isUnlistedShareSync()).toBeFalse();
		});
	});

	describe('currentShareToken setter', () => {
		it('should clear the shareLinks cache when the token changes', async () => {
			apiSpy.getShareLinksByToken.and.resolveTo([
				{ accessRestrictions: 'none' } as ShareLink,
			]);
			await service.primeForToken('abc123');

			expect(service.isUnlistedShareSync()).toBeTrue();

			service.currentShareToken = 'different';

			expect(service.isUnlistedShareSync()).toBeFalse();
		});

		it('should preserve the shareLinks cache when the token does not change', async () => {
			apiSpy.getShareLinksByToken.and.resolveTo([
				{ accessRestrictions: 'none' } as ShareLink,
			]);
			await service.primeForToken('abc123');

			service.currentShareToken = 'abc123';

			expect(service.isUnlistedShareSync()).toBeTrue();
		});
	});

	describe('router navigation cleanup', () => {
		it('should clear cache when navigating off a share route', async () => {
			apiSpy.getShareLinksByToken.and.resolveTo([
				{ accessRestrictions: 'none' } as ShareLink,
			]);
			await service.primeForToken('abc123');

			expect(service.isUnlistedShareSync()).toBeTrue();

			routerEvents.next(new NavigationEnd(1, '/app/private', '/app/private'));

			expect(service.currentShareToken).toBe('');
			expect(service.isUnlistedShareSync()).toBeFalse();
		});

		it('should preserve cache when navigating within share routes', async () => {
			apiSpy.getShareLinksByToken.and.resolveTo([
				{ accessRestrictions: 'none' } as ShareLink,
			]);
			await service.primeForToken('abc123');

			routerEvents.next(new NavigationEnd(1, '/share/abc123', '/share/abc123'));

			expect(service.currentShareToken).toBe('abc123');
			expect(service.isUnlistedShareSync()).toBeTrue();
		});
	});
});
