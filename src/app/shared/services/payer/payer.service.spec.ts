/* @format */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AccountService } from '../account/account.service';
import { PayerService } from './payer.service';

describe('PayerService', () => {
  let service: PayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AccountService],
    });
    service = TestBed.inject(PayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
