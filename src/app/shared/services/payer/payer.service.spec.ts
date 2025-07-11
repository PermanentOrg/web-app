/* @format */
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AccountService } from '../account/account.service';
import { PayerService } from './payer.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PayerService', () => {
  let service: PayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [AccountService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(PayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
