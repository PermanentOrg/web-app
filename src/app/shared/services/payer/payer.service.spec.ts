import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AccountService } from '../account/account.service';
import { PayerService } from './payer.service';

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
