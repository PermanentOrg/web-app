import { TestBed } from '@angular/core/testing';
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing';
import { HttpV2Service } from '@shared/services/http-v2/http-v2.service';
import { environment } from '@root/environments/environment';
import { StelaItems } from '@root/utils/stela-items';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { ShareLink } from '../models/share-link';
import { ShareLinksApiService } from './share-links-api.service';

describe('ShareLinksApiService', () => {
	let service: ShareLinksApiService;
	let http: HttpTestingController;

	function makeShareLinks(quantity: number): ShareLink[] {
		return new Array(quantity).fill({
			id: '123',
			itemId: 'record-id',
			itemType: 'record',
			token: 'test-token',
			permissionsLevel: 'viewer',
			accessRestrictions: 'none',
			maxUses: null,
			usesExpended: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
	}

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				HttpV2Service,
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		});
		service = TestBed.inject(ShareLinksApiService);
		http = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		http.verify();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should get multiple share links by ID', async () => {
		const expected: StelaItems<ShareLink> = { items: makeShareLinks(3) };
		const promise = service.getShareLinksById([123, 456, 789]);

		const req = http.expectOne(
			`${environment.apiUrl}/v2/share-links?shareLinkIds[]=123&shareLinkIds[]=456&shareLinkIds[]=789`,
		);

		expect(req.request.method).toBe('GET');
		expect(req.request.headers.get('Request-Version')).toBe('2');

		req.flush(expected);
		const result = await promise;

		expect(result).toEqual(expected.items);
	});

	it('should handle error when getting share links by ID', async () => {
		const promise = service.getShareLinksById([123]);

		const req = http.expectOne(
			`${environment.apiUrl}/v2/share-links?shareLinkIds[]=123`,
		);
		req.flush({}, { status: 400, statusText: 'Bad Request' });

		await expectAsync(promise).toBeRejected();
	});

	it('should get share links by token', async () => {
		const expected: StelaItems<ShareLink> = { items: makeShareLinks(1) };
		const promise = service.getShareLinksByToken(['token-1', 'token-2']);

		const req = http.expectOne(
			`${environment.apiUrl}/v2/share-links?shareTokens[]=token-1&shareTokens[]=token-2`,
		);

		expect(req.request.method).toBe('GET');
		expect(req.request.headers.get('Request-Version')).toBe('2');

		req.flush(expected);
		const result = await promise;

		expect(result).toEqual(expected.items);
	});

	it('should handle error when getting share links by token', async () => {
		const promise = service.getShareLinksByToken(['token']);

		const req = http.expectOne(
			`${environment.apiUrl}/v2/share-links?shareTokens[]=token`,
		);
		req.flush({}, { status: 400, statusText: 'Bad Request' });

		await expectAsync(promise).toBeRejected();
	});

	it('should generate a share link', async () => {
		const expected: ShareLink = {
			id: '7',
			itemId: '4',
			itemType: 'record',
			token: 'abc-token',
			permissionsLevel: 'viewer',
			accessRestrictions: 'none',
			maxUses: null,
			usesExpended: null,
			expirationTimestamp: null,
			createdAt: new Date('2025-04-09T13:09:07.755Z'),
			updatedAt: new Date('2025-04-09T13:09:07.755Z'),
		};

		const promise = service.generateShareLink({
			itemId: '4',
			itemType: 'record',
		});

		const req = http.expectOne(`${environment.apiUrl}/v2/share-links`);

		expect(req.request.method).toBe('POST');
		expect(req.request.body).toEqual({ itemId: '4', itemType: 'record' });

		req.flush({ data: expected });
		const result = await promise;

		expect(result).toEqual(expected);
	});

	it('should handle error when generating share link', async () => {
		const promise = service.generateShareLink({
			itemId: '4',
			itemType: 'record',
		});

		const req = http.expectOne(`${environment.apiUrl}/v2/share-links`);
		req.flush({}, { status: 400, statusText: 'Bad Request' });

		await expectAsync(promise).toBeRejected();
	});

	it('should delete a share link', async () => {
		const promise = service.deleteShareLink('7');

		const req = http.expectOne(`${environment.apiUrl}/v2/share-links/7`);

		expect(req.request.method).toBe('DELETE');
		expect(req.request.headers.get('Request-Version')).toBe('2');

		req.flush({}, { status: 204, statusText: 'No Content' });
		await expectAsync(promise).toBeResolved();
	});

	it('should handle error when deleting share link', async () => {
		const promise = service.deleteShareLink('7');

		const req = http.expectOne(`${environment.apiUrl}/v2/share-links/7`);
		req.flush({}, { status: 400, statusText: 'Bad Request' });

		await expectAsync(promise).toBeRejected();
	});

	it('should update a share link', async () => {
		const expected: ShareLink = {
			id: '7',
			itemId: '4',
			itemType: 'record',
			token: 'abc-token',
			permissionsLevel: 'viewer',
			accessRestrictions: 'account',
			maxUses: null,
			usesExpended: null,
			expirationTimestamp: null,
			createdAt: new Date('2025-04-09T13:09:07.755Z'),
			updatedAt: new Date('2025-04-09T13:09:07.755Z'),
		};

		const promise = service.updateShareLink('7', {
			accessRestrictions: 'account',
		});

		const req = http.expectOne(`${environment.apiUrl}/v2/share-links/7`);

		expect(req.request.method).toBe('PATCH');
		expect(req.request.body).toEqual({ accessRestrictions: 'account' });

		req.flush({ data: expected });
		const result = await promise;

		expect(result).toEqual(expected);
	});

	it('should handle error when updating share link', async () => {
		const promise = service.updateShareLink('7', {
			accessRestrictions: 'account',
		});

		const req = http.expectOne(`${environment.apiUrl}/v2/share-links/7`);
		req.flush({}, { status: 400, statusText: 'Bad Request' });

		await expectAsync(promise).toBeRejected();
	});
});
