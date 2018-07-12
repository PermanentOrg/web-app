import { Component, OnInit } from '@angular/core';
import { Router } from '../../../../../node_modules/@angular/router';

import { AccountService } from '../../../shared/services/account/account.service';

@Component({
  selector: 'pr-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(private account: AccountService, private router: Router) { }

  ngOnInit() {
  }

  logOut() {
    this.account.logOut()
    .then(() => {
      this.router.navigate(['/login']);
    });
  }

}
