/* @format */
import { Component, Output, EventEmitter } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';

@Component({
  selector: 'pr-create-archive-for-me-screen',
  templateUrl: './create-archive-for-me-screen.component.html',
  styleUrl: './create-archive-for-me-screen.component.scss',
})
export class CreateArchiveForMeScreenComponent {
  private readonly TYPE = 'type.archive.person';
  public name = '';

  @Output() goBackOutput = new EventEmitter<string>();
  @Output() continueOutput = new EventEmitter<Record<string, string>>();

  constructor(private account: AccountService) {
    this.name = this.account.getAccount().fullName;
  }

  public goBack(): void {
    this.goBackOutput.emit('start');
  }

  public continute(): void {
    this.continueOutput.emit({ screen: 'goals', type: this.TYPE, name: this.name });
  }
}
