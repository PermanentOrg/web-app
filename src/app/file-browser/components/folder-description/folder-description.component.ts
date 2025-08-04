/* @format */
import { Component, Input } from '@angular/core';
import { FolderVO } from '@models';

@Component({
  selector: 'pr-folder-description',
  templateUrl: './folder-description.component.html',
  styleUrls: ['./folder-description.component.scss'],
  standalone: false,
})
export class FolderDescriptionComponent {
  @Input() folder: FolderVO;

  constructor() {}
}
