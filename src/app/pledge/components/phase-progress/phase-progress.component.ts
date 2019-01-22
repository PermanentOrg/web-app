import { Component, OnInit, ElementRef, ContentChild } from '@angular/core';
import ProgressBar from 'progressbar.js';

@Component({
  selector: 'pr-phase-progress',
  templateUrl: './phase-progress.component.html',
  styleUrls: ['./phase-progress.component.scss']
})
export class PhaseProgressComponent implements OnInit {
  public progress = .45;
  public innerBar: ProgressBar;

  constructor(
    private elementRef: ElementRef
  ) { }

  ngOnInit() {
    this.innerBar = new ProgressBar.Line(this.elementRef.nativeElement.querySelector('.progress-bar'), {
      strokeWidth: 4,
      easing: 'easeInOut',
      duration: 1400,
      color: '#800080',
      svgStyle: {width: '100%', height: '100%'},
      from: {color: '#FFEA82'},
      to: {color: '#ED6A5A'}
    });
    setTimeout(() => {
      this.redrawProgress();
    });

    setTimeout(() => {
      this.progress = 0.55;
      this.redrawProgress();
    }, 4000);
  }

  redrawProgress() {
    this.innerBar.animate(this.progress);
    // TweenLite.to(
    //   this.innerBar,
    //   2,
    //   {
    //     width: `${this.progress * 100}%`,
    //     ease: 'Power4.easeOut'
    //   }
    // );
  }

}
