/* @format */
import { Dialog } from '@root/app/dialog/dialog.module';
import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { OnboardingScreen } from '@onboarding/shared/onboarding-screen';
import { ArchiveVO } from '@models/archive-vo';

@Component({
  selector: 'pr-welcome-screen',
  templateUrl: './welcome-screen.component.html',
  styleUrls: ['./welcome-screen.component.scss'],
})
export class WelcomeScreenComponent implements OnInit {
  @Input() pendingArchives: ArchiveVO[] = [];
  @Output() nextScreen = new EventEmitter<OnboardingScreen>();
  @Output() selectInvitation = new EventEmitter<ArchiveVO>();

  selectedValue: string = '';
  name: string = '';

  public OnboardingScreen: typeof OnboardingScreen = OnboardingScreen;

  constructor() {}

  ngOnInit(): void {}

  public goToScreen(screen: OnboardingScreen): void {
    this.nextScreen.emit(screen);
  }

  public selectPendingArchive(archive: ArchiveVO): void {
    this.selectInvitation.emit(archive);
  }
}
