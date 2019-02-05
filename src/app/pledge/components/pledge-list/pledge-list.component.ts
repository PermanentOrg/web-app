import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

import { PledgeData } from '@pledge/components/new-pledge/new-pledge.component'; 

@Component({
  selector: 'pr-pledge-list',
  templateUrl: './pledge-list.component.html',
  styleUrls: ['./pledge-list.component.scss']
})
export class PledgeListComponent implements OnInit, OnDestroy {
  public pledges: any[] = [];

  pledgesByNew: any[] = [];
  pledgesByAmount: any[] = [];

  newPledgeRef = this.db.database.ref('/publicPledges').orderByChild('timestamp').startAt(new Date().getTime());
  newPledgeListener: any;

  constructor(
    private db: AngularFireDatabase,
    private zone: NgZone
  ) {
  }

  async ngOnInit() {
    const current = (await this.db.database.ref('/publicPledges').limitToLast(100).once('value')).val();

    for (const pledgeId in current) {
      if (current.hasOwnProperty(pledgeId)) {
        const pledge = current[pledgeId];
        this.pledgesByNew.unshift(pledge);
        this.pledgesByAmount.unshift(pledge);
      }
    }

    this.pledges = this.pledgesByNew;
    this.sortAmountArray();

    this.newPledgeListener = this.newPledgeRef.on('child_added', snapshot => {
      this.zone.run(() => {
        const newPledge = snapshot.val();
        this.pledgesByNew.unshift(newPledge);
        this.pledgesByAmount.push(newPledge);
        this.sortAmountArray();
      })
    });
  }

  sortAmountArray() {
    this.pledgesByAmount.sort((a, b) => b.dollarAmount - a.dollarAmount);
  }

  setSort(array) {
    this.pledges = array;
  }

  ngOnDestroy(): void {
    this.newPledgeRef.off('child_added', this.newPledgeListener);
  }

}
