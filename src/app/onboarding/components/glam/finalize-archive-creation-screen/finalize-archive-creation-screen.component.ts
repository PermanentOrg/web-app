/* @format */
import { Component, Output, EventEmitter } from '@angular/core';
import { ArchiveVO } from '@models/index';
import { OnboardingService } from '@root/app/onboarding/services/onboarding.service';

@Component({
  selector: 'pr-finalize-archive-creation-screen',
  templateUrl: './finalize-archive-creation-screen.component.html',
  styleUrl: './finalize-archive-creation-screen.component.scss',
})
export class FinalizeArchiveCreationScreenComponent {
  @Output() finalizeArchiveOutput = new EventEmitter<string>();
  public archives: ArchiveVO[];
  public isArchiveSubmitted: boolean = false;

  constructor(onboardingService: OnboardingService) {
    this.archives = onboardingService.getFinalArchives();
  }

  finalizeArchive() {
    this.isArchiveSubmitted = true;
    this.finalizeArchiveOutput.emit();
  }
}
