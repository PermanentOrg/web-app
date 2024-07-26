import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ArchiveVO } from '@models/index';
import { AccountService } from '@shared/services/account/account.service';

@Component({
  selector: 'pr-glam-pending-archives',
  templateUrl: './glam-pending-archives.component.html',
  styleUrl: './glam-pending-archives.component.scss',
})
export class GlamPendingArchivesComponent implements OnInit {
  @Input() pendingArchives: ArchiveVO[] = [];

  @Output() createNewArchiveOutput = new EventEmitter<void>();
  @Output() nextOutput = new EventEmitter<ArchiveVO>();

  public accountName: string = '';
  public selectedArchive: ArchiveVO = null;

  constructor(private account: AccountService) {
    this.accountName = this.account.getAccount().fullName;
  }

  ngOnInit(): void {
    console.log(this.pendingArchives);
  }

  createNewArchive(): void {
    this.createNewArchiveOutput.emit();
  }

  next(): void {
    this.nextOutput.emit(this.selectedArchive);
  }

  selectArchive(archive: ArchiveVO): void {
    this.selectedArchive = archive;
  }
}
