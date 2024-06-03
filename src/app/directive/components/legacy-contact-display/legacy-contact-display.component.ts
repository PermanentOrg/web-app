/* @format */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LegacyContact } from '@models/directive';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';

@Component({
  selector: 'pr-legacy-contact-display',
  templateUrl: './legacy-contact-display.component.html',
  styleUrls: ['./legacy-contact-display.component.scss'],
})
export class LegacyContactDisplayComponent implements OnInit {
  @Input() public initialLegacyContact: LegacyContact;
  @Output() public beginEdit = new EventEmitter<void>();
  @Output() public loadedLegacyContact = new EventEmitter<LegacyContact>();
  public legacyContact: LegacyContact;
  public error: boolean = false;

  constructor(
    protected account: AccountService,
    protected api: ApiService,
  ) {
    this.legacyContact = this.initialLegacyContact;
  }

  public async ngOnInit() {
    try {
      this.legacyContact = await this.api.directive.getLegacyContact();
      this.loadedLegacyContact.emit(this.legacyContact);
    } catch {
      this.error = true;
    }
  }
}
