import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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

  public previousProgress: ProgressData = this.currentProgress;

  public dollarCountUpOptions = {
    useEasing: true,
    useGrouping: true,
    separator: ',',
    decimal: '.',
    prefix: '$'
  };

  public percentCountUpOptions = {
    useEasing: true,
    useGrouping: true,
    separator: ',',
    decimal: '.',
    suffix: '%'
  };

  public pledgeCountUpOptions = {
    useEasing: true,
    useGrouping: true,
    separator: ',',
    decimal: '.'
  };

  constructor(
    private db: AngularFireDatabase
  ) { 
    db.list('/progress', ref => ref.orderByKey().limitToLast(1)).valueChanges()
      .subscribe((listValue) => {
        if(listValue.length){
          this.previousProgress = this.currentProgress;
          this.currentProgress = listValue.pop() as ProgressData;
        }
      });
  }

  ngOnInit() {
  }
}
