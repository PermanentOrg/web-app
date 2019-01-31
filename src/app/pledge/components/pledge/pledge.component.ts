import { Component, OnInit, ViewChild, AfterViewInit, HostBinding, ElementRef, OnDestroy } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ActivatedRoute } from '@angular/router';

import APP_CONFIG from '@root/app/app.config';
import { IFrameService } from '@shared/services/iframe/iframe.service';

export interface ProgressData {
  activePhase: number;
  totalDollarAmount: number;
  goalDollarAmount: number;
  totalPledges: number;
  totalStorageAmount: number;
}
@Component({
  selector: 'pr-pledge',
  templateUrl: './pledge.component.html',
  styleUrls: ['./pledge.component.scss']
})
export class PledgeComponent implements OnInit, OnDestroy {
  @HostBinding('class.no-bg') noBackground = false;

  public currentProgress: ProgressData = {
    activePhase: 1,
    totalDollarAmount: 0,
    goalDollarAmount: 150000,
    totalPledges: 0,
    totalStorageAmount: 0
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

  public storageCountUpoptions = {
    useEasing: true,
    useGrouping: true,
    separator: ',',
    decimal: '.',
    suffix: ' GB'
  };

  public pledgeCountUpOptions = {
    useEasing: true,
    useGrouping: true,
    separator: ',',
    decimal: '.'
  };

  public pricePerGb = APP_CONFIG.pricePerGb;

  constructor(
    private db: AngularFireDatabase,
    private route: ActivatedRoute,
    public iFrame: IFrameService,
    private elementRef: ElementRef
  ) { 
    db.list('/progress', ref => ref.orderByKey().limitToLast(1)).valueChanges()
      .subscribe((listValue) => {
        if(listValue.length){
          this.previousProgress = this.currentProgress;
          this.currentProgress = listValue.pop() as ProgressData;
        }
      });
    
    this.noBackground = this.route.snapshot.queryParams.wordpress !== undefined;
  }

  ngOnInit() {
    this.iFrame.setSizeTarget(this.elementRef.nativeElement);
  }

  ngOnDestroy() {
    this.iFrame.reset();
  }
}
