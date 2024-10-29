/* @format */
import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomOverlayContainer extends OverlayContainer {
  public appendContainer(node: Element): void {
    const container = document.createElement('div');
    container.classList.add('cdk-overlay-container');

    const parent = node.querySelector('pr-app-root') || node;
    parent.appendChild(container);
    this._containerElement = container;
  }

  protected _createContainer(): void {
    this.appendContainer(document.body);
  }
}
