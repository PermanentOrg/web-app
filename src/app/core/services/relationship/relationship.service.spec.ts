import { TestBed } from '@angular/core/testing';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { AccountService } from '@shared/services/account/account.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CookieService } from 'ngx-cookie-service';
import { StorageService } from '@shared/services/storage/storage.service';
import { RelationshipService } from './relationship.service';

describe('RelationshipService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			providers: [
				CookieService,
				AccountService,
				StorageService,
				RelationshipService,
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		});
	});

	it('should be created', () => {
		const service = TestBed.inject(RelationshipService);

		expect(service).toBeTruthy();
	});
});
