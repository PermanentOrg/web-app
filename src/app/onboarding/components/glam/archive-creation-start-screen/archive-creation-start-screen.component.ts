import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';

@Component({
  selector: 'pr-archive-creation-start-screen',
  templateUrl: './archive-creation-start-screen.component.html',
  styleUrl: './archive-creation-start-screen.component.scss',
})
export class ArchiveCreationStartScreenComponent implements OnInit {
  @Output() public getStartedOutput = new EventEmitter<void>();
  @Output() public createArchiveForMeOutput = new EventEmitter<void>();
  public name: string = '';
  public hasShareToken = false;
  public sharerName: string;
  public sharedItemName: string;

  constructor(private account: AccountService) {
    this.name = this.account.getAccount().fullName;
  }

  ngOnInit(): void {
    const token =
      localStorage.getItem('shareToken') ||
      localStorage.getItem('shareTokenFromCopy');
    if (token) {
      this.hasShareToken = true;
    }
  }

  public getStarted() {
    this.getStartedOutput.emit();
  }

  public createArchiveForMe(): void {
    this.createArchiveForMeOutput.emit();
  }
}
