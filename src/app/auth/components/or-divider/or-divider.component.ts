import { Component, Input } from '@angular/core';

@Component({
  selector: 'pr-or-divider',
  standalone: false,
  templateUrl: './or-divider.component.html',
  styleUrl: './or-divider.component.scss',
})
export class OrDividerComponent {
  @Input() public text: string = '';
}
