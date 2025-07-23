/* @format */
import {
  Component,
  OnInit,
  ElementRef,
  ContentChild,
  Input,
  OnChanges,
  SimpleChanges,
  HostBinding,
  AfterViewInit,
} from '@angular/core';
import ProgressBar from 'progressbar.js';

import { APP_CONFIG } from '@root/app/app.config';
import { AngularFireDatabase } from '@angular/fire/compat/database';
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
  styleUrls: ['./phase-progress.component.scss'],
  standalone: false,
})
export class PhaseProgressComponent implements OnInit {
  @HostBinding('class.for-light-bg') forLightBg = true;
  @HostBinding('class.for-dark-bg') forDarkBg = false;
  @HostBinding('class.visible') visible = false;

  public innerBar: ProgressBar;

  public currentProgress: ProgressData = {
    activePhase: 1,
    totalDollarAmount: 0,
    goalDollarAmount: 150000,
    totalPledges: 0,
    totalStorageAmount: 0,
  };

  public previousProgress: ProgressData = this.currentProgress;

  public dollarCountUpOptions = {
    useEasing: true,
    useGrouping: true,
    separator: ',',
    decimal: '.',
    prefix: '$',
    startValue: 0,
  };

  public percentCountUpOptions = {
    useEasing: true,
    useGrouping: true,
    separator: ',',
    decimal: '.',
    suffix: '%',
    startValue: 0,
  };

  public storageCountUpOptions = {
    useEasing: true,
    useGrouping: true,
    separator: ',',
    decimal: '.',
    suffix: ' GB',
    startValue: 0,
  };

  public pledgeCountUpOptions = {
    useEasing: true,
    useGrouping: true,
    separator: ',',
    decimal: '.',
    startValue: 0,
  };

  public pricePerGb = APP_CONFIG.pricePerGb;

  constructor(
    private elementRef: ElementRef,
    private db: AngularFireDatabase,
    private route: ActivatedRoute,
    public iFrame: IFrameService,
  ) {
    db.list('/progress', (ref) => ref.orderByKey().limitToLast(1))
      .valueChanges()
      .subscribe((listValue) => {
        if (listValue && listValue.length) {
          this.previousProgress = this.currentProgress;
          this.currentProgress = listValue.pop() as ProgressData;
          this.redrawProgress();
        }
      });

    this.forLightBg = this.route.snapshot.queryParams.theme === 'forLightBg';
    this.forDarkBg = this.route.snapshot.queryParams.theme === 'forDarkBg';
    setTimeout(() => {
      this.visible = true;
    });
  }

  updateCountUpOptions() {
    this.dollarCountUpOptions.startValue =
      this.previousProgress.totalDollarAmount;
    this.pledgeCountUpOptions.startValue = this.previousProgress.totalPledges;
    this.storageCountUpOptions.startValue =
      this.previousProgress.totalStorageAmount;
    this.percentCountUpOptions.startValue =
      (100 * this.previousProgress.totalDollarAmount) /
      this.previousProgress.goalDollarAmount;
  }

  ngOnInit() {
    try {
      this.innerBar = new ProgressBar.Line(
        this.elementRef.nativeElement.querySelector('.progress-bar'),
        {
          strokeWidth: 4,
          easing: 'easeInOut',
          duration: 1500,
          offset: 0,
          color: '#FF9933',
          svgStyle: { width: '100%', height: '100%' },
        },
      );
      this.redrawProgress();
    } catch (err) {}
  }

  redrawProgress() {
    if (this.innerBar) {
      const percentage = Math.min(
        this.currentProgress.totalDollarAmount /
          this.currentProgress.goalDollarAmount,
        1,
      );
      try {
        this.innerBar.animate(percentage);
      } catch (err) {}
    }
  }
}
