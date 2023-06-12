/* @format */
import { Component } from '@angular/core';
import { LegacyContact } from '@models/directive';
import { DialogState } from '../directive-dialog/directive-dialog.component';

@Component({
  selector: 'pr-legacy-contact-dialog',
  templateUrl: './legacy-contact-dialog.component.html',
  styleUrls: ['./legacy-contact-dialog.component.scss'],
})
export class LegacyContactDialogComponent {
  public mode: DialogState = 'display';
  public legacyContact: LegacyContact;

  public setLegacyContact(legacyContact: LegacyContact): void {
    this.legacyContact = Object.assign({}, legacyContact);
  }

  public saveEditedLegacyContact(legacyContact: LegacyContact): void {
    this.setLegacyContact(legacyContact);
    this.mode = 'display';
  }
}
