/* @format */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LegacyContact } from '@models/directive';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

@Component({
  selector: 'pr-legacy-contact-edit',
  templateUrl: './legacy-contact-edit.component.html',
  styleUrls: ['./legacy-contact-edit.component.scss'],
})
export class LegacyContactEditComponent implements OnInit {
  @Input() public legacyContact: LegacyContact;
  @Output() public savedLegacyContact = new EventEmitter<LegacyContact>();
  public name: string;
  public email: string;
  public waiting = false;

  constructor(private api: ApiService, private message: MessageService) {}

  ngOnInit(): void {
    this.name = this.legacyContact?.name;
    this.email = this.legacyContact?.email;
  }

  public async saveLegacyContact() {
    this.waiting = true;
    try {
      let returnedLegacyContact: LegacyContact;
      if (this.isUpdating()) {
        returnedLegacyContact = await this.api.directive.updateLegacyContact({
          name: this.name,
          email: this.email,
        });
      } else {
        returnedLegacyContact = await this.api.directive.createLegacyContact({
          name: this.name,
          email: this.email,
        });
      }
      this.savedLegacyContact.emit(returnedLegacyContact);
    } catch {
      this.message.showError(
        "An error occured when saving your account's Legacy Contact. Please try again."
      );
    } finally {
      this.waiting = false;
    }
  }

  protected isUpdating(): boolean {
    return !!(this.legacyContact?.name && this.legacyContact?.email);
  }
}
