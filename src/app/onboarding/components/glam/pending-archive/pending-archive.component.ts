/* @format */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ArchiveVO } from '@models/index';

@Component({
  selector: 'pr-pending-archive',
  templateUrl: './pending-archive.component.html',
  styleUrl: './pending-archive.component.scss',
})
export class PendingArchiveComponent implements OnInit {
  readonly roles = {
    'access.role.viewer': 'Viewer',
    'access.role.editor': 'Editor',
    'access.role.contributor': 'Contributor',
    'access.role.curator': 'Curator',
    'access.role.manager': 'Manager',
  };

  @Input() archive: ArchiveVO;
  @Input() isSelected: boolean = false;

  @Output() acceptArchiveOutput = new EventEmitter<ArchiveVO>();

  constructor() {}

  ngOnInit(): void {}

  acceptArchive(archive: ArchiveVO): void {
    this.acceptArchiveOutput.emit(archive);
  }
}
