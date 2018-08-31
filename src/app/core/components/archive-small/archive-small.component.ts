import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';

import { ArchiveVO } from '@root/app/models';

@Component({
  selector: 'pr-archive-small',
  templateUrl: './archive-small.component.html',
  styleUrls: ['./archive-small.component.scss']
})
export class ArchiveSmallComponent implements OnInit, OnChanges {
  @Input() archive: ArchiveVO;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
  }

}
