import { Component, OnInit, ElementRef, ContentChild, Input, OnChanges, SimpleChanges, HostBinding } from '@angular/core';
import ProgressBar from 'progressbar.js';

import APP_CONFIG from '@root/app/app.config';
import { AngularFireDatabase } from '@angular/fire/database';
import { ActivatedRoute } from '@angular/router';
import { IFrameService } from '@shared/services/iframe/iframe.service';

export interface ProgressData {
  activePhase: number;
  totalDollarAmount: number;
  goalDollarAmount: number;
  totalPledges: number;
  totalStorageAmount: number;
}

@Component({
  selector: 'pr-phase-progress',
  templateUrl: './phase-progress.component.html',
  styleUrls: ['./phase-progress.component.scss']
})
export class PhaseProgressComponent implements OnInit, OnChanges {
  @Input('progress') progress = 0;
  @HostBinding('class.for-light-bg') forLightBg = true;
  @HostBinding('class.for-dark-bg') forDarkBg = false;
  @HostBinding('class.visible') visible = false;

  public innerBar: ProgressBar;

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
    private elementRef: ElementRef,
    private db: AngularFireDatabase,
    private route: ActivatedRoute,
    public iFrame: IFrameService,
  ) {
  db.list('/progress', ref => ref.orderByKey().limitToLast(1)).valueChanges()
    .subscribe((listValue) => {
      if (listValue.length) {
        this.previousProgress = this.currentProgress;
        this.currentProgress = listValue.pop() as ProgressData;
      }
    });

  this.forLightBg = this.route.snapshot.queryParams.theme === 'forLightBg';
  this.forDarkBg = this.route.snapshot.queryParams.theme === 'forDarkBg';
  }

  ngOnInit() {
    this.innerBar = new ProgressBar.Line(this.elementRef.nativeElement.querySelector('.progress-bar'), {
      strokeWidth: 4,
      easing: 'easeInOut',
      duration: 1500,
      color: '#FF9933',
      svgStyle: {width: '100%', height: '100%'},
      from: {color: '#FFEA82'},
      to: {color: '#ED6A5A'}
    });
    this.redrawProgress();

    setTimeout(() => {
      this.visible = true;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.redrawProgress();
  }

  redrawProgress() {
    if(this.innerBar) {
      this.innerBar.animate(this.progress);
    }
  }

}
