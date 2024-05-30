import { Component, Output, EventEmitter } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';

@Component({
  selector: 'pr-archive-creation-start-screen',
  templateUrl: './archive-creation-start-screen.component.html',
  styleUrl: './archive-creation-start-screen.component.scss',
})
export class ArchiveCreationStartScreenComponent {
  @Output() public getStartedOutput = new EventEmitter<void>();
  @Output() public createArchiveForMeOutput = new EventEmitter<void>();
  public name: string = '';

  constructor(private account:AccountService){
    this.name = this.account.getAccount().fullName;
  }

  public getStarted() {
    this.getStartedOutput.emit();
  }

  public createArchiveForMe(): void {
    this.createArchiveForMeOutput.emit();
  }
}
