import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AccountService } from '../account/account.service';

@Injectable({
  providedIn: 'root',
})
export class PayerService {
  private payer = new BehaviorSubject<string>('');
  payerIdObs = this.payer.asObservable();

  get payerId(): string {
    return this.payer.value;
  }

  set payerId(value: string) {
    this.payer.next(value);
  }

  constructor(private account: AccountService) {
    this.payerId = this.account.getArchive()?.payerAccountId;
  }
}
