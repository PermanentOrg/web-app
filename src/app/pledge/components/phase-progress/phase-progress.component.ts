import { Component, OnInit, ElementRef, ContentChild } from '@angular/core';
import { TweenLite, TweenMax } from 'gsap';
@Component({
  selector: 'pr-phase-progress',
  templateUrl: './phase-progress.component.html',
  styleUrls: ['./phase-progress.component.scss']
})
export class PhaseProgressComponent implements OnInit {
  public progress = .75;
  public innerBar: HTMLElement;

  constructor(
    private elementRef: ElementRef
  ) { }

  ngOnInit() {
    this.innerBar = this.elementRef.nativeElement.querySelector('.progress-bar-inner');
    setTimeout(() => {
      this.redrawProgress();
    });
  }

  redrawProgress() {
    TweenLite.to(
      this.innerBar,
      2,
      {
        width: `${this.progress * 100}%`,
        ease: 'Power4.easeOut'
      }
    );
  }

}
