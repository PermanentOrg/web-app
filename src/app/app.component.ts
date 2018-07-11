import { Component, OnInit } from '@angular/core';
import { ApiService } from './core/services/api/api.service';
import { AccountService } from './core/services/account/account.service';
import { AuthResponse } from './core/services/api/auth.repo';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app';

  constructor(private api: ApiService, private account: AccountService) {
  }

  ngOnInit() {
  }
}
