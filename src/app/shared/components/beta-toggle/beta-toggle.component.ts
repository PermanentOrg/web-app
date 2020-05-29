import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'pr-beta-toggle',
  templateUrl: './beta-toggle.component.html',
  styleUrls: ['./beta-toggle.component.scss']
})
export class BetaToggleComponent implements OnInit {
  public hasCookie: boolean;

  constructor(
    private cookie: CookieService
  ) {
    this.hasCookie = this.cookie.check('permBeta');
  }

  ngOnInit(): void {
  }

  onClick() {
    this.cookie.delete('permBeta', '/', `.${window.location.hostname}`);
    setTimeout(() => {
      window.location.assign(`https://${window.location.host}/app`);
    });
  }
}
