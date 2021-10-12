import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ArchiveVO } from '@models/archive-vo';

@Component({
  selector: 'pr-create-new-archive',
  templateUrl: './create-new-archive.component.html',
  styleUrls: ['./create-new-archive.component.scss']
})
export class CreateNewArchiveComponent implements OnInit {
  @Output() createdArchive = new EventEmitter<ArchiveVO>();

  constructor() {
  }

  ngOnInit(): void {
  }

  public onSubmit(archive: ArchiveVO): void {
    this.createdArchive.emit(archive);
  }

  public onError(): void {
    // do nothing
  }

}
