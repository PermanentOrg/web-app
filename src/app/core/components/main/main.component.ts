import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AccountService } from '@shared/services/account/account.service';
import { MessageService } from '@shared/services/message/message.service';

@Component({
  selector: 'pr-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(private accountService: AccountService, private router: Router, private messageService: MessageService) { }

  ngOnInit() {
  }

}
