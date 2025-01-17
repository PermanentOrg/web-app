import { Injectable } from '@angular/core';
import { throttle } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class IFrameService {
  private sizeTarget: HTMLElement | any;

  private boundToResize = false;
  public resizeOnly = false;

  public resizeIFrameThrottled = throttle(() => {
    this.resizeIFrame();
  }, 64);

  constructor() {}

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
      (window.frameElement as any).style.height =
        `${this.sizeTarget.offsetHeight}px`;
    }
  }

  isIFrame() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

  getIFrame() {
    return window.frameElement;
  }

  reset() {
    this.sizeTarget = null;
    this.boundToResize = false;
    window.removeEventListener('resize', this.resizeIFrameThrottled);
  }

  setParentUrl(targetUrl) {
    window.parent.location.href = targetUrl;
  }
}
