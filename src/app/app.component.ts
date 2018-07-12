import { Component, OnInit } from '@angular/core';
import { ApiService } from './core/services/api/api.service';
import { AccountService } from './core/services/account/account.service';
import { MessageService } from './shared/message/service/message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app';

  constructor(private api: ApiService, private account: AccountService, private message: MessageService) {
  }

  ngOnInit() {
    // this.message.showMessage('test 1', 'primary');

    // setTimeout(() => {
    //   this.message.showMessage('test 2', 'danger');
    // }, 5000);
  }
}
