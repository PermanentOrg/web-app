/* @format */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LegacyContact } from '@models/directive';
import { AnalyticsService } from '@shared/services/analytics/analytics.service';
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

  constructor(
    private api: ApiService,
    private message: MessageService,
    private analytics: AnalyticsService
  ) {}

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
          legacyContactId: this.legacyContact.legacyContactId,
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
      await this.analytics.notifyObservers({
        entity: 'legacy_contact',
        action: this.isUpdating() ? 'update' : 'create',
        version: 1,
        entityId: returnedLegacyContact.legacyContactId.toString(),
        body: {
          analytics: {
            event: 'Edit Legacy Contact',
            data: {},
          },
        },
      });
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
