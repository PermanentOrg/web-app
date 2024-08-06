import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomOverlayContainer extends OverlayContainer {
  protected _createContainer(): void {
    const container = document.createElement('div');
    container.classList.add('cdk-overlay-container');

    const parent = document.querySelector('pr-app-root') || document.body;
    if (parent) {
      parent.appendChild(container);
    } else {
      document.body.appendChild(container);
    }
    this._containerElement = container;
  }
}
