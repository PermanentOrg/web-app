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
    this.acceptedArchives = [...this.onboardingService.getFinalArchives()];
    this.selectedArchive = this.acceptedArchives[0] ?? null;
    this.accountName = this.account.getAccount().fullName;
  }

  createNewArchive(): void {
    this.createNewArchiveOutput.emit();
  }

  next(): void {
    this.nextOutput.emit(this.selectedArchive);
  }

  async selectArchive(archive: ArchiveVO) {
    try {
      await this.api.archive.accept(archive);
      this.acceptedArchives.push(archive);
      this.onboardingService.registerArchive(archive);
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
