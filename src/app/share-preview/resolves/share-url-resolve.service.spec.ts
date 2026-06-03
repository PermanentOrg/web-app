import { TestBed } from '@angular/core/testing';
import {
	ActivatedRouteSnapshot,
	Router,
	RouterStateSnapshot,
} from '@angular/router';

import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { DeviceService } from '@shared/services/device/device.service';
import { MessageService } from '@shared/services/message/message.service';
import { ShareResponse } from '@shared/services/api/share.repo';
import { ShareLinksService } from '@root/app/share-links/services/share-links.service';

import { ShareUrlResolveService } from './share-url-resolve.service';

describe('ShareUrlResolveService', () => {
	let service: ShareUrlResolveService;
	let checkShareLinkSpy: jasmine.Spy;
	let primeForTokenSpy: jasmine.Spy;
	let routerNavigateSpy: jasmine.Spy;
	let messageShowErrorSpy: jasmine.Spy;

	const buildRoute = (shareToken: string) =>
		({ params: { shareToken } }) as unknown as ActivatedRouteSnapshot;
	const buildState = () => ({}) as RouterStateSnapshot;

	beforeEach(() => {
		checkShareLinkSpy = jasmine.createSpy('checkShareLink');
		primeForTokenSpy = jasmine
			.createSpy('primeForToken')
			.and.resolveTo(undefined);
		routerNavigateSpy = jasmine.createSpy('navigate').and.resolveTo(true);
		messageShowErrorSpy = jasmine.createSpy('showError');

		TestBed.configureTestingModule({
			providers: [
				ShareUrlResolveService,
				{
					provide: ApiService,
					useValue: { share: { checkShareLink: checkShareLinkSpy } },
				},
				{
					provide: MessageService,
					useValue: { showError: messageShowErrorSpy },
				},
				{ provide: Router, useValue: { navigate: routerNavigateSpy } },
				{ provide: DeviceService, useValue: {} },
				{
					provide: AccountService,
					useValue: { setRedirect: jasmine.createSpy() },
				},
				{
					provide: ShareLinksService,
					useValue: { primeForToken: primeForTokenSpy },
				},
			],
		});
		service = TestBed.inject(ShareUrlResolveService);
	});

	it('should resolve sharePreviewVO and prime the share-links cache in parallel', async () => {
		const sharePreviewVO = { ArchiveVO: {} } as any;
		const successResponse = {
			isSuccessful: true,
			getShareByUrlVO: () => sharePreviewVO,
		} as unknown as ShareResponse;
		checkShareLinkSpy.and.resolveTo(successResponse);

		const result = await service.resolve(buildRoute('abc123'), buildState());

		expect(checkShareLinkSpy).toHaveBeenCalledWith('abc123');
		expect(primeForTokenSpy).toHaveBeenCalledWith('abc123');
		expect(result).toBe(sharePreviewVO);
	});

	it('should navigate to share/error when checkShareLink fails', async () => {
		const failureResponse = {
			isSuccessful: false,
			getMessage: () => 'oops',
			messageIncludes: () => false,
		} as unknown as ShareResponse;
		checkShareLinkSpy.and.rejectWith(failureResponse);

		await service.resolve(buildRoute('abc123'), buildState());

		expect(routerNavigateSpy).toHaveBeenCalledWith(['share', 'error']);
		expect(messageShowErrorSpy).toHaveBeenCalled();
	});

	it('should still resolve sharePreviewVO when primeForToken fails', async () => {
		const sharePreviewVO = { ArchiveVO: {} } as any;
		const successResponse = {
			isSuccessful: true,
			getShareByUrlVO: () => sharePreviewVO,
		} as unknown as ShareResponse;
		checkShareLinkSpy.and.resolveTo(successResponse);
		// primeForToken swallows its own errors and always resolves,
		// so the resolver should never see a rejection from it.
		primeForTokenSpy.and.resolveTo(undefined);

		const result = await service.resolve(buildRoute('abc123'), buildState());

		expect(result).toBe(sharePreviewVO);
	});
});
