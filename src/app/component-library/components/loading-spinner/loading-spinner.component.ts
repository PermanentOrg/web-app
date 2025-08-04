/* @format */
import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'pr-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss',
  standalone: false,
})
export class LoadingSpinnerComponent {
  @Input() isFullScreen = false;

  @HostBinding('class.full-screen') get fullScreenClass() {
    return this.isFullScreen;
  }
}
