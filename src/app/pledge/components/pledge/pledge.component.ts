import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

export interface ProgressData {
  activePhase: number;
  totalDollarAmount: number;
  goalDollarAmount: number;
  totalPledges: number;
}
@Component({
  selector: 'pr-pledge',
  templateUrl: './pledge.component.html',
  styleUrls: ['./pledge.component.scss']
})
export class PledgeComponent implements OnInit {
  public currentProgress: ProgressData = {
    activePhase: 1,
    totalDollarAmount: 0,
    goalDollarAmount: 150000,
    totalPledges: 0
  };

  constructor(
    private db: AngularFireDatabase
  ) { 
    db.list('/progress', ref => ref.orderByKey().limitToLast(1)).valueChanges()
      .subscribe((listValue) => {
        if(listValue.length){
          this.currentProgress = listValue.pop() as ProgressData;
          console.log('new progress :)', this.currentProgress);
        }
      });
  }

  ngOnInit() {
  }

}
