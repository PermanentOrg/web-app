/* @format */
import { ArchiveVO } from '@models/archive-vo';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Dialog } from '@root/app/dialog/dialog.service';

@Component({
  selector: 'pr-switcher',
  templateUrl: './switcher.component.html',
  styleUrls: ['./switcher.component.scss'],
})
export class SwitcherComponent {
  @Input() isChecked: boolean;
  @Input() change: (val: any) => void;
  @Input() archive: ArchiveVO;
  @Input() data: any;
  @ViewChild('switch', { static: false }) switch: ElementRef;
  constructor(private dialog: Dialog) {}
}
