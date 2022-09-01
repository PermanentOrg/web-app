import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { DataSnapshot, DatabaseReference } from '@angular/fire/compat/database/interfaces';
import { merge } from 'lodash';

import { AccountService } from '@shared/services/account/account.service';

import { PledgeData } from '@pledge/components/new-pledge/new-pledge.component';
import { AccountVO, BillingPaymentVO } from '@models';

@Injectable()
export class PledgeService {
  public currentPledge: DatabaseReference;
  public currentPledgeData: any | PledgeData = {};

  public pledgesList = this.db.list('/pledges');

  constructor(
    private db: AngularFireDatabase,
  ) {
  }

  getPledgeId() {
    return this.currentPledge.key || null;
  }

  async loadPledge(pledgeId: string) {
    this.currentPledge = await this.db.database.ref(`/pledges/${pledgeId}`);
    if (!this.currentPledge) {
      throw new Error('PledgeService - error loading pledge');
    }

    const pledgeExists = (await this.currentPledge.once('value')).exists();

    if (!pledgeExists) {
      throw new Error('PledgeService - pledge not found');
    }

    const pledgeData = (await this.currentPledge.once('value')).val();

    merge(this.currentPledgeData, pledgeData);

    this.currentPledge.on('value', snapshot => {
      merge(this.currentPledgeData, snapshot.val());
    });

    return this.currentPledge;
  }

  async linkAccount(account: AccountVO) {
    if (!this.currentPledge) {
      throw new Error('PledgeService - no pledge to link to account');
    }

    if (this.currentPledgeData.accountId) {
      throw new Error('PledgeService - pledge already linked to account');
    }

    return await this.currentPledge.update({ accountId: account.accountId });
  }

  createBillingPaymentVo(account: AccountVO) {
    return new BillingPaymentVO({
      accountIdThatPaid: account.accountId,
      refIdToIncrease: account.accountId,
      donationAmount: 0,
      donationMatchAmount: 0,
      storageAmount: this.currentPledgeData.dollarAmount,
      monetaryAmount: this.currentPledgeData.dollarAmount.toFixed(2),
      spaceAmountInGb: Math.floor(this.currentPledgeData.dollarAmount / 10)
    });
  }
}
