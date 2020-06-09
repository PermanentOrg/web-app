import { Component, OnInit } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { AccountVO } from '@models';

@Component({
  selector: 'pr-storage-meter',
  templateUrl: './storage-meter.component.html',
  styleUrls: ['./storage-meter.component.scss']
})
export class StorageMeterComponent implements OnInit {
  account: AccountVO;

  constructor(
    private accountService: AccountService
  ) {
    this.account = this.accountService.getAccount();
  }

  ngOnInit(): void {
  }

  getMeterWidth() {
    const widthFraction = Math.min((this.account.spaceTotal - this.account.spaceLeft) / this.account.spaceTotal, 1);
    return `${widthFraction * 100}%`;
  }

}
