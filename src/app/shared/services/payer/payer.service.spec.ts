import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { PayerService } from './payer.service';
import { AccountService } from '../account/account.service';

describe('PayerService', () => {
  let service: PayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpClient, AccountService, HttpHandler],
    });
    service = TestBed.inject(PayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
