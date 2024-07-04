/* @format */
import { Component, EventEmitter, Input, Output } from '@angular/core';

type VARIANT = 'primary' | 'secondary' | 'tertiary' | 'link';
type MODE = 'light' | 'dark';
type SIZE = 'hug' | 'fill';
type ORIENTATION = 'left' | 'right';
type HEIGHT = 'medium' | 'large';
type TYPE = 'submit' | 'reset' | 'button';

@Component({
  selector: 'pr-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  //Inputs
  @Input() variant: VARIANT = 'primary';
  @Input() height: HEIGHT = 'medium';
  @Input() mode: MODE = 'light';
  @Input() size: SIZE = 'hug';
  @Input() disabled: boolean = false;
  @Input() icon: string = '';
  @Input() orientation: ORIENTATION = 'left';
  @Input() faIcon: string = '';
  @Input() buttonType: TYPE = 'button';

  //Outputs
  @Output() buttonClick = new EventEmitter<MouseEvent>();

  onClick($event) {
    this.buttonClick.emit($event);
  }
}