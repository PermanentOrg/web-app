/* @format */
import { Component, OnInit } from '@angular/core';
import { LegacyContact } from '@models/directive';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

@Component({
  selector: 'pr-legacy-contact-display',
  templateUrl: './legacy-contact-display.component.html',
  styleUrls: ['./legacy-contact-display.component.scss'],
})
export class LegacyContactDisplayComponent implements OnInit {
  public legacyContact: LegacyContact;
  public error: boolean = false;

  constructor(protected account: AccountService, protected api: ApiService) {}

  public async ngOnInit() {
    try {
      this.legacyContact = await this.api.directive.getLegacyContact();
    } catch {
      this.error = true;
    }
  }
}
