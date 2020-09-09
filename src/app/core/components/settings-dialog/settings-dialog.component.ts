import { Component, OnInit, Inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@root/app/dialog/dialog.module';

export type SettingsTab = 'storage' | 'account' | 'notification' | 'billing';

@Component({
  selector: 'pr-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.scss']
})
export class SettingsDialogComponent implements OnInit {
  activeTab: SettingsTab = 'account';

  constructor(
    @Inject(DIALOG_DATA) public data: any,
    private dialogRef: DialogRef,
  ) {
    if (data.tab) {
      this.activeTab = data.tab;
    }
  }

  ngOnInit(): void {
  }

  onDoneClick() {
    this.dialogRef.close();
  }

  setTab(tab: SettingsTab) {
    this.activeTab = tab;
  }

}
