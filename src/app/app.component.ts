import { Component, OnInit } from '@angular/core';
import { ApiService } from './shared/services/api/api.service';
import { AccountService } from './shared/services/account/account.service';
import { MessageService } from './shared/services/message/message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private api: ApiService, private account: AccountService, private message: MessageService) {
  }

  ngOnInit() {
  }
}
