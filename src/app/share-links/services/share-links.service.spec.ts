import { TestBed } from '@angular/core/testing';
import { ShareLink } from '../models/share-link';
import { ShareLinksService } from './share-links.service';
import { ShareLinksApiService } from './share-links-api.service';

describe('ShareLinksService', () => {
	let service: ShareLinksService;
	let apiSpy: jasmine.SpyObj<ShareLinksApiService>;

	beforeEach(() => {
		apiSpy = jasmine.createSpyObj('ShareLinksApiService', [
			'getShareLinksByToken',
		]);

		TestBed.configureTestingModule({
			providers: [
				ShareLinksService,
				{ provide: ShareLinksApiService, useValue: apiSpy },
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
});
