/* @format */
import { Component, Output, EventEmitter } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { OnboardingService } from '@root/app/onboarding/services/onboarding.service';
import { ArchiveVO } from '@models/index';
import { ArchiveCreateEvent } from '../types/archive-types';

@Component({
  selector: 'pr-create-archive-for-me-screen',
  templateUrl: './create-archive-for-me-screen.component.html',
  styleUrl: './create-archive-for-me-screen.component.scss',
})
export class CreateArchiveForMeScreenComponent {
  private readonly TYPE = 'type.archive.person';
  public name = '';

  @Output() goBackOutput = new EventEmitter<string>();
  @Output() continueOutput = new EventEmitter<ArchiveCreateEvent>();

  constructor(
    private account: AccountService,
    private onboardingService: OnboardingService,
  ) {
    this.name = this.account.getAccount().fullName;
  }

  public goBack(): void {
    this.goBackOutput.emit('start');
  }

  public continue(): void {
    this.onboardingService.registerArchive(
      new ArchiveVO({ fullName: this.name, accessRole: 'access.role.owner' }),
    );
    this.continueOutput.emit({
      screen: 'goals',
      type: this.TYPE,
      name: this.name,
    });
  }
}
