import { Component, OnInit, ViewChild, ElementRef, ViewChildren, QueryList, Inject } from '@angular/core';
import { IsTabbedDialog, DialogRef, DIALOG_DATA } from '@root/app/dialog/dialog.module';
import { ArchiveVO, AccountVO } from '@models';
import { AccountService } from '@shared/services/account/account.service';
import { Router } from '@angular/router';
import { partition, remove, find, orderBy } from 'lodash';
import { ApiService } from '@shared/services/api/api.service';
import { ArchiveResponse } from '@shared/services/api/archive.repo';
import { MessageService } from '@shared/services/message/message.service';
import { ArchiveSmallComponent } from '@shared/components/archive-small/archive-small.component';
import { ArchiveType } from '@models/archive-vo';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RELATION_OPTIONS, PromptService } from '@shared/services/prompt/prompt.service';

export type MyArchivesTab = 'switch' | 'new' | 'pending';

interface ArchiveFormData {
  fullName: string;
  type: ArchiveType;
  relationType: string;
}

const ARCHIVE_TYPES: { text: string, value: ArchiveType }[] = [
  {
    text: 'Person',
    value: 'type.archive.person'
  },
  {
    text: 'Family',
    value: 'type.archive.family'
  },
  {
    text: 'Organization',
    value: 'type.archive.organization'
  },
];

@Component({
  selector: 'pr-my-archives-dialog',
  templateUrl: './my-archives-dialog.component.html',
  styleUrls: ['./my-archives-dialog.component.scss']
})
export class MyArchivesDialogComponent implements OnInit, IsTabbedDialog {
  account: AccountVO;
  currentArchive: ArchiveVO;
  archives: ArchiveVO[];
  pendingArchives: ArchiveVO[];
  waiting = false;

  archiveTypes = ARCHIVE_TYPES;
  relationTypes = RELATION_OPTIONS;
  newArchiveForm: FormGroup;

  activeTab: MyArchivesTab = 'switch';
  @ViewChild('panel') panelElem: ElementRef;

  @ViewChildren(ArchiveSmallComponent) archiveComponents: QueryList<ArchiveSmallComponent>;

  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: any,
    private accountService: AccountService,
    private api: ApiService,
    private prompt: PromptService,
    private message: MessageService,
    private fb: FormBuilder,
  ) {
    this.newArchiveForm = this.fb.group({
      fullName: ['', [Validators.required]],
      type: [ARCHIVE_TYPES[0].value, [Validators.required]],
      relationType: [null]
    });

    if (this.data && this.data.activeTab) {
      this.activeTab = this.data.activeTab as MyArchivesTab;
    }
  }

  ngOnInit(): void {
    this.account = this.accountService.getAccount();
    this.currentArchive = this.accountService.getArchive();
    [this.pendingArchives, this.archives] = partition(
      orderBy(this.accountService.getArchives(), a => a.fullName.toLowerCase()),
      { status: 'status.generic.pending'}
    );
  }

  setTab(tab: MyArchivesTab) {
    this.activeTab = tab;
    this.panelElem.nativeElement.scrollTop = 0;
  }

  onDoneClick(): void {
    this.dialogRef.close();
  }

  scrollToArchive(archive: ArchiveVO) {
    setTimeout(() => {
      const component = find(this.archiveComponents.toArray(), cmp => cmp.archive === archive);
      if (component) {
        (component.element.nativeElement as HTMLElement).scrollIntoView({behavior: 'smooth'});
      }
    });
  }

  async onArchiveClick(archive: ArchiveVO) {
    if (archive.isPendingAction) {
      return;
    }

    try {
      archive.isPendingAction = true;
      await this.accountService.changeArchive(archive);
      this.onDoneClick();
    } catch (err) {}
  }

  async onArchiveMakeDefaultClick(archive: ArchiveVO) {
    if (archive.isPendingAction || archive.archiveId === this.account.defaultArchiveId) {
      return;
    }

    try {
      archive.isPendingAction = true;
      const updateAccount = new AccountVO({defaultArchiveId: archive.archiveId});
      await this.accountService.updateAccount(updateAccount);
    } catch (err) {
      this.message.showError('There was a problem changing the default archive.', false);
    } finally {
      archive.isPendingAction = false;
    }
  }

  async onArchiveDeleteClick(archive: ArchiveVO) {
    if (this.currentArchive.archiveId === archive.archiveId || archive.accessRole !== 'access.role.owner') {
      return;
    }

    if (archive.isPendingAction || archive.archiveId === this.account.defaultArchiveId) {
      return;
    }

    archive.isPendingAction = true;
    try {
      await this.prompt.confirm(
        `Delete The ${archive.fullName} Archive`,
        'Are you sure you want to permanently delete this archive?',
        null,
        'btn-danger'
        );
    } catch (err) {
      return;
    }

    try {
      await this.api.archive.delete(archive);
      remove(this.archives, archive);
    } catch (err) {
      this.message.showError('There was a problem deleting this archive.', false);
      archive.isPendingAction = false;
    }
  }

  async acceptPendingArchive(archive: ArchiveVO) {
    try {
      archive.isPendingAction = true;
      await this.api.archive.accept(archive);
      archive.status = 'status.generic.ok';
      remove(this.pendingArchives, archive);
      this.archives.push(archive);
      this.setTab('switch');
      this.scrollToArchive(archive);
    } catch (err) {
      if (err instanceof ArchiveResponse) {
        this.message.showError(err.getMessage(), true);
      }
    } finally {
      archive.isPendingAction = false;
    }
  }

  async declinePendingArchive(archive: ArchiveVO) {
    try {
      archive.isPendingAction = true;
      await this.api.archive.decline(archive);
      remove(this.pendingArchives, archive);
    } catch (err) {
      if (err instanceof ArchiveResponse) {
        this.message.showError(err.getMessage(), true);
      }
    } finally {
      archive.isPendingAction = false;
    }
  }

  public onNewArchiveFormSubmit(newArchive: ArchiveVO): void {
    this.archives.push(newArchive);
    this.setTab('switch');
    this.scrollToArchive(newArchive);
    this.waiting = false;
  }

  public onNewArchiveFormFailure(err): void {
    if (err instanceof ArchiveResponse) {
      this.message.showError(err.getMessage(), true);
    }
    this.waiting = false;
  }
}
