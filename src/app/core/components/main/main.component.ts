import { Component, OnInit } from '@angular/core';
import { Router } from '../../../../../node_modules/@angular/router';

import { AccountService } from '../../../shared/services/account/account.service';
import { MessageService } from '../../../shared/services/message/message.service';

@Component({
  selector: 'pr-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(private accountService: AccountService, private router: Router, private messageService: MessageService) { }

  ngOnInit() {
  }

  logOut() {
    this.accountService.logOut()
    .then(() => {
      this.messageService.showMessage(`Logged out`, 'success');
      this.router.navigate(['/login']);
    });
  }

}
