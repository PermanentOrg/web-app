import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { OnboardingScreen } from '@onboarding/shared/onboarding-screen';

import { ArchiveVO } from '@models/archive-vo';

@Component({
  selector: 'pr-welcome-screen',
  templateUrl: './welcome-screen.component.html',
  styleUrls: ['./welcome-screen.component.scss']
})
export class WelcomeScreenComponent implements OnInit {
  @Input() pendingArchives: ArchiveVO[] = [];
  @Output() nextScreen = new EventEmitter<OnboardingScreen>();
  @Output() acceptInvitation = new EventEmitter<ArchiveVO>();

  public OnboardingScreen: typeof OnboardingScreen = OnboardingScreen;

  constructor() { }

  ngOnInit(): void {
  }

  public goToScreen(screen: OnboardingScreen): void {
    this.nextScreen.emit(screen);
  }

  public acceptPendingArchive(archive: ArchiveVO): void {
    this.acceptInvitation.emit(archive);
  }
}
