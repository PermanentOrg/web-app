import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { DataSnapshot, DatabaseReference } from '@angular/fire/database/interfaces';

import { AccountService } from '@shared/services/account/account.service';

import { PledgeData } from '@pledge/components/new-pledge/new-pledge.component';

@Injectable()
export class PledgeService {
  public currentPledge: DatabaseReference;

  public pledgesList = this.db.list('/pledges');

  constructor(
    private db: AngularFireDatabase,
    private accountService: AccountService
  ) {
  }

  async createPledge(pledgeData: PledgeData) {
    this.currentPledge = await this.pledgesList.push(pledgeData);
    if (!this.currentPledge) {
      throw new Error('PledgeService - error saving pledge');
    }

    return this.currentPledge;
  }

  async linkAccount() {
    if (!this.currentPledge) {
      throw new Error('PledgeService - no pledge to link to account');
    }

    const currentPledgeData = (await this.currentPledge.once('value')).val() as PledgeData;

    if (currentPledgeData.accountId) {
      throw new Error('PledgeService - pledge already linked to account');
    }

    const accountId = this.accountService.getAccount().accountId;
    await this.currentPledge.update({ accountId: accountId });
  }
}
