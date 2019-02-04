import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

@Component({
  selector: 'pr-pledge-list',
  templateUrl: './pledge-list.component.html',
  styleUrls: ['./pledge-list.component.scss']
})
export class PledgeListComponent implements OnInit {
  public pledges;

  constructor(
    private db: AngularFireDatabase
  ) { }

  ngOnInit() {
    this.pledges = this.db.list('/publicPledges', ref => ref.limitToLast(10)).valueChanges();
  }

}
