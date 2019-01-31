import { Injectable } from '@angular/core';
import { throttle } from 'lodash';

@Injectable()
export class IFrameService {
  private sizeTarget: HTMLElement | any;

  private boundToResize = false;

  public resizeIFrameThrottled = throttle(() => {
    this.resizeIFrame();
  }, 64);

  constructor() { }

  setSizeTarget(element: HTMLElement | any) {
    if (this.isIFrame()) {
      this.sizeTarget = element;

      setTimeout(() => {
        this.resizeIFrame();
      });


      if (!this.boundToResize) {
        window.addEventListener('resize', this.resizeIFrameThrottled);
        this.boundToResize = true;
      }
    }
  }

  resizeIFrame() {
    if (this.isIFrame() && this.sizeTarget) {
      (window.frameElement as any).style.height = `${this.sizeTarget.offsetHeight}px`;
    }
  }

  isIFrame() {
    return !!window.frameElement;
  }

  getIFrame() {
    return window.frameElement;
  }

  reset() {
    this.sizeTarget = null;
    this.boundToResize = false;
    window.removeEventListener('resize', this.resizeIFrameThrottled);
  }
}
