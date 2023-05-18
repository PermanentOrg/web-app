import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Directive, DirectiveUpdateRequest } from '@models/directive';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';

@Component({
  selector: 'pr-directive-edit',
  templateUrl: './directive-edit.component.html',
  styleUrls: ['./directive-edit.component.scss'],
})
export class DirectiveEditComponent implements OnInit {
  @Output() public savedDirective = new EventEmitter<Directive>();
  @Input() public directive: Directive;
  public email: string;
  public note: string;
  public waiting = false;
  public archiveName: string;
  public accountExists = true;

  constructor(
    private api: ApiService,
    private account: AccountService,
    private message: MessageService
  ) {}

  ngOnInit(): void {
    if (this.directive) {
      this.email = this.directive.steward.email;
      this.note = this.directive.note;
    }
    this.archiveName = this.account.getArchive().fullName;
  }

  public async submitForm(): Promise<void> {
    this.waiting = true;
    this.accountExists = true;
    try {
      if (this.directive) {
        const directive: DirectiveUpdateRequest = {
          directiveId: this.directive.directiveId,
        };
        directive.stewardEmail = this.directive.steward.email;
        directive.note = this.note;
        const response = await this.api.directive.update(directive);
        this.catchNotFoundError(response);
        this.directive = response;
        this.savedDirective.emit(this.directive);
      } else {
        const savedDirective = await this.api.directive.create({
          archiveId: this.account.getArchive().archiveId.toString(),
          type: 'transfer',
          trigger: {
            type: 'admin',
          },
          stewardEmail: this.email,
          note: this.note,
        });
        this.catchNotFoundError(savedDirective);
        this.savedDirective.emit(savedDirective);
      }
    } catch {
      if (this.accountExists) {
        this.message.showError(
          'There was an error trying to save the Archive Steward information. Please try again.'
        );
      }
    } finally {
      this.waiting = false;
    }
  }

  protected catchNotFoundError(response: unknown): void {
    if (response instanceof HttpErrorResponse) {
      const error = response as HttpErrorResponse;
      if (error.status === 0) {
        throw new Error('Network/Client Error');
      } else {
        this.accountExists = false;
        this.message.showError(
          'The given e-mail address, "' +
            this.email +
            '", is not currently registered to a user on Permanent'
        );
        throw new Error(error.error.message);
      }
    }
  }
}
