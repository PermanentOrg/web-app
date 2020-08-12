import { Component, OnInit } from '@angular/core';
import { IsTabbedDialog } from '@root/app/dialog/dialog.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

type InvitationsTab = 'new' | 'pending' | 'accepted';

@Component({
  selector: 'pr-invitations-dialog',
  templateUrl: './invitations-dialog.component.html',
  styleUrls: ['./invitations-dialog.component.scss']
})
export class InvitationsDialogComponent implements OnInit, IsTabbedDialog {
  newInviteForm: FormGroup;

  activeTab: InvitationsTab = 'new';
  constructor(
    private fb: FormBuilder
  ) {
    this.newInviteForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
  }

  setTab(tab: InvitationsTab) {
    this.activeTab = tab;
  }

  onDoneClick() {
  }

}
