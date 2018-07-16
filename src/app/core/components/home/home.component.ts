import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AccountService } from '../../../shared/services/account/account.service';
import { MessageService } from '../../../shared/services/message/message.service';

@Component({
  selector: 'pr-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private accountService: AccountService, private router: Router, private messageService: MessageService) { }

  ngOnInit() {
  }

  logOut() {
    this.accountService.logOut()
    .then(() => {
      this.messageService.showMessage(`Logged out successfully`, 'success');
      this.router.navigate(['/login']);
    });
  }

}
