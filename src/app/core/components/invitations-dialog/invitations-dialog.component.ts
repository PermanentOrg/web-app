import { Component, OnInit } from '@angular/core';
import { IsTabbedDialog } from '@root/app/dialog/dialog.module';

type InvitationsTab = 'new' | 'pending' | 'accepted';

@Component({
  selector: 'pr-invitations-dialog',
  templateUrl: './invitations-dialog.component.html',
  styleUrls: ['./invitations-dialog.component.scss']
})
export class InvitationsDialogComponent implements OnInit, IsTabbedDialog {

  activeTab: InvitationsTab = 'new';
  constructor(

  ) { }

  ngOnInit(): void {
  }

  setTab(tab: InvitationsTab) {
    this.activeTab = tab;
  }

  onDoneClick() {
  }

}
