import { Component, OnInit, Input, Output, EventEmitter, HostBinding, OnChanges, SimpleChanges, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';
import { ArchiveVO } from '@root/app/models';

@Component({
  selector: 'pr-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss']
})
export class LeftMenuComponent implements OnInit, OnChanges {
  @Input() isVisible = false;
  @Output() isVisibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  public archiveName: string;
  public archive: ArchiveVO;

  private hamburgerMenuDiv: HTMLElement;

  constructor(
    private accountService: AccountService,
    private messageService: MessageService,
    private router: Router,
    private elementRef: ElementRef
  ) {
    if (this.accountService.getArchive()) {
      this.archive = this.accountService.getArchive();
    }

    this.accountService.archiveChange.subscribe((archive: ArchiveVO) => {
      this.archive = archive;
    });
  }

  ngOnInit() {
    this.hamburgerMenuDiv = (this.elementRef.nativeElement as HTMLElement).querySelector('.hamburger-menu');

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isVisible.currentValue && !changes.isVisible.previousValue) {
      this.hamburgerMenuDiv.scrollTop = 0;
    }
  }

  hide(event: Event) {
    this.isVisible = false;
    this.isVisibleChange.emit(this.isVisible);
    event.stopPropagation();
    return false;
  }

  logOut() {
    this.accountService.logOut()
    .then(() => {
      this.messageService.showMessage(`Logged out successfully`, 'success');
      this.router.navigate(['/login']);
    });
  }

}
