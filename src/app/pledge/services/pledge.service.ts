import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { DataSnapshot, DatabaseReference } from '@angular/fire/database/interfaces';
import { merge } from 'lodash';

import { AccountService } from '@shared/services/account/account.service';

import { PledgeData } from '@pledge/components/new-pledge/new-pledge.component';
import { AccountVO } from '@models/index';

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

  async createPledge(pledgeData: PledgeData) {
    this.currentPledge = await this.pledgesList.push(pledgeData);
    if (!this.currentPledge) {
      throw new Error('PledgeService - error saving pledge');
    }

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


}
