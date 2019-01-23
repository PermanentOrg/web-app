import { Component, OnInit, ElementRef, ContentChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import ProgressBar from 'progressbar.js';

@Component({
  selector: 'pr-phase-progress',
  templateUrl: './phase-progress.component.html',
  styleUrls: ['./phase-progress.component.scss']
})
export class PhaseProgressComponent implements OnInit, OnChanges {
  @Input('progress') progress: number = 0;
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
    this.redrawProgress();
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
