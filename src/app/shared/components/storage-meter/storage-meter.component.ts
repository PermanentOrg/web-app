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

  animate = false;

  constructor(
    private accountService: AccountService
  ) {
    this.account = this.accountService.getAccount();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.animate = true;
    });
  }

  getMeterWidth() {
    const widthFraction = Math.min((this.account.spaceTotal - this.account.spaceLeft) / this.account.spaceTotal, 1);
    return `${widthFraction * 100}%`;
  }

  getMeterTransform() {
    if (!this.animate) {
      return null;
    }

    const widthFraction = Math.min((this.account.spaceTotal - this.account.spaceLeft) / this.account.spaceTotal, 1);
    return `transform: translateX(${(widthFraction * 100) - 100}%)`;
  }

}
