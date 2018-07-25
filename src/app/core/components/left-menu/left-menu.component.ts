import { Component, OnInit, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { Router } from '@angular/router';

import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';

@Component({
  selector: 'pr-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss']
})
export class LeftMenuComponent implements OnInit {
  @Input() isVisible: boolean;
  @Output() isVisibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  public accountName: string;

  constructor(private accountService: AccountService, private messageService: MessageService, private router: Router) {
    if (this.accountService.getAccount()) {
      this.accountName = this.accountService.getAccount().fullName;
    }
  }

  ngOnInit() {
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
