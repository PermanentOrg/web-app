import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { ArchiveVO } from '@root/app/models';

@Component({
  selector: 'pr-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss']
})
export class ShareComponent implements OnInit {
  @Input() archive: ArchiveVO;

  constructor(public element: ElementRef) { }

  ngOnInit() {
  }

}
