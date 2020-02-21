import { Component, OnInit, Input } from '@angular/core';
import { FolderVO } from '@models/index';

@Component({
  selector: 'pr-folder-description',
  templateUrl: './folder-description.component.html',
  styleUrls: ['./folder-description.component.scss']
})
export class FolderDescriptionComponent implements OnInit {
  @Input() folder: FolderVO;

  constructor() { }

  ngOnInit() {
  }

}
