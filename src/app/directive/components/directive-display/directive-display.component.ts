import { Component, OnInit } from '@angular/core';
import { AccountVO, Directive } from '@models/index';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';

@Component({
  selector: 'pr-directive-display',
  templateUrl: './directive-display.component.html',
  styleUrls: ['./directive-display.component.scss'],
})
export class DirectiveDisplayComponent implements OnInit {
  public archiveName: string;
  public directive: Directive;
  public error: boolean;

  constructor(private account: AccountService, private api: ApiService) {
    this.error = false;
  }

  async ngOnInit(): Promise<void> {
    this.archiveName = this.account.getArchive().fullName;
    await this.getDirective();
  }

  protected async getDirective(): Promise<void> {
    try {
      this.directive = await this.api.directive.get(this.account.getArchive());
    } catch {
      this.error = true;
      return;
    }
    if (this.directive?.note) {
      this.directive.note = this.directive.note.trim();
    }
  }
}
