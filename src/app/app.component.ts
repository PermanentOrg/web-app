import { Component, OnInit } from '@angular/core';
import { ApiService } from './core/services/api/api.service';
import { AccountService } from './core/services/account/account.service';
import { AuthResponse } from './core/services/api/auth.repo';

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

    this.account.logIn(testUser.email, testUser.password, true, true)
    .then((response: AuthResponse) => {
      if (response.needsMFA()) {
        const tokenValue = prompt('whats the token baby?');
        return this.account.verifyMfa(tokenValue).then(console.log);
      } else {
        console.log('i guess its logged in');
      }
    });
  }
}
