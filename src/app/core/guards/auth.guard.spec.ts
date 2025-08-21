import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthGuard } from '@core/guards/auth.guard';
import { CookieService } from 'ngx-cookie-service';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';

describe('AuthGuard', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [RouterTestingModule],
			providers: [
				AuthGuard,
				CookieService,
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		});
	});

	it('should create', () => {
		const guard = TestBed.inject(AuthGuard);

		expect(guard).toBeTruthy();
	});
});
