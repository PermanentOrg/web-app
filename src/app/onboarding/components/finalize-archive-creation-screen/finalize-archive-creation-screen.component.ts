/* @format */
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'pr-finalize-archive-creation-screen',
  templateUrl: './finalize-archive-creation-screen.component.html',
  styleUrl: './finalize-archive-creation-screen.component.scss',
})
export class FinalizeArchiveCreationScreenComponent {
  @Input() name: string = '';
  @Output() finalizeArchiveOutput = new EventEmitter<string>();

  finalizeArchive() {
    this.finalizeArchiveOutput.emit();
  }
}
