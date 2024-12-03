/* @format */
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'pr-finalize-archive-creation-screen',
  templateUrl: './finalize-archive-creation-screen.component.html',
  styleUrl: './finalize-archive-creation-screen.component.scss',
})
export class FinalizeArchiveCreationScreenComponent implements OnInit {
  @Input() name: string = '';
  @Output() finalizeArchiveOutput = new EventEmitter<string>();
  public isArchiveSubmitted: boolean = false;

  ngOnInit(): void {
    const storageName = sessionStorage.getItem('archiveName');
    if (storageName) {
      this.name = storageName;
    }
  }

  finalizeArchive() {
    this.isArchiveSubmitted = true;
    this.finalizeArchiveOutput.emit();
  }
}
