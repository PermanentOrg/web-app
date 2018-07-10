import { Component, OnInit } from '@angular/core';
import { ApiService } from './core/services/api/api.service';
import { AccountService } from './core/services/account/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app';

  constructor(private api: ApiService, private account: AccountService) {
  }

  ngOnInit() {
    const testUser = {
      email: 'aatwood@permanent.org',
      password: 'yomama0101'
    };

    this.account.isLoggedIn();
  }
}
