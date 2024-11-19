/* @format */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ArchiveVO } from '@models/index';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { OnboardingService } from '../../services/onboarding.service';

@Component({
  selector: 'pr-glam-pending-archives',
  templateUrl: './glam-pending-archives.component.html',
  styleUrl: './glam-pending-archives.component.scss',
})
export class GlamPendingArchivesComponent {
  @Input() pendingArchives: ArchiveVO[] = [];

  @Output() createNewArchiveOutput = new EventEmitter<void>();
  @Output() nextOutput = new EventEmitter<ArchiveVO>();

  public accountName: string = '';
  public selectedArchive: ArchiveVO = null;
  public acceptedArchives: ArchiveVO[] = [];

  constructor(
    private account: AccountService,
    private api: ApiService,
    private onboardingService: OnboardingService,
  ) {
    this.accountName = this.account.getAccount().fullName;
  }

  createNewArchive(): void {
    this.createNewArchiveOutput.emit();
  }

  next(): void {
    for (const archive of this.acceptedArchives) {
      this.onboardingService.registerArchive(archive);
    }
    this.nextOutput.emit(this.selectedArchive);
  }

  async selectArchive(archive: ArchiveVO) {
    try {
      await this.api.archive.accept(archive);
      this.acceptedArchives.push(archive);
      if (!this.selectedArchive) {
        this.selectedArchive = archive;
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  isSelected(archiveId: string | number): boolean {
    return !!this.acceptedArchives.find((a) => a.archiveId === archiveId);
  }
}
