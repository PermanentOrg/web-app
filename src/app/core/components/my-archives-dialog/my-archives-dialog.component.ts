import { Component, OnInit } from '@angular/core';
import { IsTabbedDialog } from '@root/app/dialog/dialog.module';

type MyArchivesTab = 'switch' | 'new' | 'pending';

@Component({
  selector: 'pr-my-archives-dialog',
  templateUrl: './my-archives-dialog.component.html',
  styleUrls: ['./my-archives-dialog.component.scss']
})
export class MyArchivesDialogComponent implements OnInit, IsTabbedDialog {
  activeTab: MyArchivesTab = 'switch';

  constructor() { }

  ngOnInit(): void {
  }

  setTab(tab: MyArchivesTab) {
    this.activeTab = tab;
  }

  onDoneClick(): void {

  }

}
